import { Message, Server as KrmxServer } from '@krmx/server';
import { produce } from 'immer';
import jsonPatch from 'json8-patch';
import { KrmxState } from './krmx-state';

// TODO: allow multiple states to be active simultaneously (to capture logic more gradually)
//       -- add enablePhase(...) and disablePhase(...) and make sure that switchPhase(...) disables current phase and enables the next
//   open questions: what about having the same phase enabled multiple times? and what about accessing data from another phase? is phase even the
//                   correct name if we would allow concurrent phases?

const krmxMessagePrefix = 'krmx-state';

export function attachTo(
  server: KrmxServer,
  state: KrmxState,
  initialPhase: { phase: string, origin: any },
) {
  if (server.getStatus() !== 'initializing') {
    throw new Error(`can only attach state to a server that is initializing, while server is '${server.getStatus()}'`);
  }

  const { phaseDefinitions } = state._extract();
  let phaseIdentifier = initialPhase.phase;
  let phaseDefinition = phaseDefinitions.get(phaseIdentifier)!._extract();
  let phaseState = phaseDefinition.originMapper(initialPhase.origin);

  let switchPhaseIndication: undefined | { phase: string, origin: any } = undefined;
  let views: Map<string, any> = new Map();

  const communicatePhaseTo = (username: string) => {
    const view = phaseDefinition.viewMapper(phaseState, username);
    server.send(username, {
      type: `${krmxMessagePrefix}/phase`,
      payload: { phaseIdentifier, view },
    });
    views.set(username, view);
  }

  const alterPhaseState = (stateModifier: (state: any) => void) => {
    phaseState = produce(state, stateModifier, undefined);
    server.getUsers().forEach(({ username, isLinked }) => {
      if (!isLinked) {
        return;
      }
      const previousView = views.get(username) ?? {};
      const nextView = produce(phaseState, (phaseState: any) => phaseDefinition.viewMapper(phaseState, username), undefined);
      const patches = jsonPatch.diff(previousView, nextView);
      server.send(username, { type: `${krmxMessagePrefix}/patches`, payload: { phaseIdentifier, patches } });
      views.set(username, nextView);
    });

    if (!switchPhaseIndication) {
      return;
    }
    phaseIdentifier = switchPhaseIndication.phase;
    phaseDefinition = phaseDefinitions.get(phaseIdentifier)!._extract();
    phaseState = phaseDefinition.originMapper(switchPhaseIndication.origin);
    switchPhaseIndication = undefined;

    server.getUsers().forEach(({ username, isLinked }) => {
      if (!isLinked) {
        return;
      }
      communicatePhaseTo(username);
    });
  };

  const switchPhase = (to: { phase: string, origin: any }) => {
    // note: if switched multiple times in a single, only the last switch is captured!
    if (switchPhaseIndication !== undefined) {
      console.warn(`[warn] switching to phase '${to.phase}' overwrites an existing intention to switch to phase '${switchPhaseIndication.phase}'. Is this intentional?`);
    }

    // defer actual switching of phase until current alteration has completely finished
    switchPhaseIndication = to;
  };

  server.on('join', (username: string) => {
    const onJoin = phaseDefinition.krmxCallbacks.onJoin;
    if (onJoin) { alterPhaseState((phaseState) => { onJoin(phaseState, username); }); }
  });

  server.on('leave', (username: string) => {
    const onLeave = phaseDefinition.krmxCallbacks.onLeave;
    if (onLeave) { alterPhaseState((phaseState) => { onLeave(phaseState, username); }); }
  });

  server.on('link', (username: string) => {
    communicatePhaseTo(username);
    const onLink = phaseDefinition.krmxCallbacks.onLink;
    if (onLink) { alterPhaseState((phaseState) => { onLink(phaseState, username); }); }
  });

  server.on('unlink', (username: string) => {
    views.delete(username);

    const onUnlink = phaseDefinition.krmxCallbacks.onUnlink;
    if (onUnlink) { alterPhaseState((phaseState) => { onUnlink(phaseState, username); }); }
  });

  server.on('message', (username: string, message: Message & { payload?: unknown }) => {
    if (!message.type.startsWith(`${phaseIdentifier}/`)) {
      return;
    }
    const actionIdentifier = message.type.substring(phaseIdentifier.length + 1);
    const action = phaseDefinition.actions.get(actionIdentifier);
    if (action === undefined) {
      return; // TODO: should this be considered an error?
    }
    const payload = action.payloadSchema.safeParse(message.payload);
    if (!payload.success) {
      return; // TODO: should this be considered an error?
    }
    alterPhaseState((state) => action.serverHandler({ state, payload: payload.data, initiator: username, switchPhase }));
  });
}
