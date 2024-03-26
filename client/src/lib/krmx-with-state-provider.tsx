import { produce } from 'immer';
import { PropsWithChildren, createContext, useContext, useRef, MutableRefObject } from 'react';
import { KrmxProvider, useKrmx } from '@krmx/client';
import { KrmxStatePrefix } from 'state';
import { patch } from 'jsondiffpatch';

type Phases = { [phaseName: string]: unknown };
const StateContext = createContext<{
  phases: Phases,
  send: (action: { type: string }) => void
    }>({ phases: {}, send: () => {} });
export function useStatePhase<T>(phaseName: string) {
  const state = useContext(StateContext);
  return {
    ...state,
    phase: state.phases[phaseName] as (T | undefined),
  };
}

export function KrmxWithStateProvider(props: PropsWithChildren & { serverUrl: string }) {
  const activePhase = useRef<string>('');
  const phases = useRef<Phases>({});
  // TODO: move onMessage out of KrmxProvider and into useKrmx in a slightly different form (subscriber)
  return <KrmxProvider
    serverUrl={props.serverUrl}
    onMessage={(message: {
        type: string,
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        payload?: any
      }) => {
      if (!message.type.startsWith(`${KrmxStatePrefix}/`)) {
        return;
      }
      const action = message.type.substring(KrmxStatePrefix.length + 1);
      switch (action) {
      case 'phase':
        phases.current = produce(phases.current, (draft) => {
          const { phaseIdentifier, view } = message.payload;
          draft[phaseIdentifier] = view;
        }, undefined);
        activePhase.current = message.payload.phaseIdentifier;
        break;
      case 'delta':
        if (activePhase.current !== message.payload.phaseIdentifier) {
          console.warn();
        }
        phases.current = produce(phases.current, (draft) => {
          const { phaseIdentifier, delta } = message.payload;
          patch(draft[phaseIdentifier], delta);
        }, undefined);
        break;
      default:
        // TODO: implement failure at some point! (+ cancel/prune optimistic updates?)
        // TODO: should there also be an 'ok' next to 'failure'?
        console.warn(`unhandled ${action} action within krmx-state`);
        break;
      }
      const phaseIdentifier = message.payload?.phaseIdentifier;
      if (phaseIdentifier) {
        console.info(action, phaseIdentifier, JSON.stringify(phases.current[phaseIdentifier]));
      }
    }}
  >
    <StateContextWithKrmx phases={phases}>
      {props.children}
    </StateContextWithKrmx>
  </KrmxProvider>;
}

function StateContextWithKrmx(props: PropsWithChildren<{ phases: MutableRefObject<Phases> }>) {
  const { send } = useKrmx();
  // TODO: inject id into metadata of send message? + use optimistic updates here?
  return <StateContext.Provider value={{ phases: props.phases.current, send }}>
    {props.children}
  </StateContext.Provider>;
}

// import { createHash } from 'crypto';
// import { createContext, MutableRefObject, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
// import { createCustomSystem, System, Action, SystemState } from 'system';
//
// export const customSystem = createCustomSystem();
//
// const SystemContext = createContext<{
//   state: SystemState,
//   optimisticState: SystemState,
//   dispatcher: (action: Action) => boolean
//     }>({
//       state: customSystem.system.initialState,
//       optimisticState: customSystem.system.initialState,
//       dispatcher: () => false,
//     });
// export const useSystem = () => {
//   return useContext(SystemContext);
// };
//
// export function KrmxWithSystemProvider(props: PropsWithChildren & { serverUrl: string }) {
//   const systemRef = useRef(customSystem.system);
//   const handlePayload = (messagePayload: unknown) => {
//     const { dispatcher, type, payload, hash } = messagePayload as unknown as {
//       dispatcher: string, type: string, payload: unknown, hash?: string,
//     };
//     if (systemRef.current.dispatch(dispatcher, { type, payload }) !== true) {
//       // TODO: disconnect on a verified dispatch that fails
//       console.error('[ERROR] system dispatch failed', { dispatcher, type, payload });
//     }
//     if (hash) {
//       // @ts-expect-error sourceState is private
//       const state = systemRef.current.sourceState;
//       const computedHash = createHash('sha256').update(JSON.stringify(state)).digest('hex');
//       if (hash !== computedHash) {
//         // TODO: disconnect on hash mismatch
//         console.error('[ERROR] system corrupted due to mismatching hashes', hash, computedHash);
//       }
//     }
//   };
//   return (
//     <KrmxProvider
//       serverUrl={props.serverUrl}
//       onMessage={(message: {
//         type: string,
//         /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
//         payload?: any
//       }) => {
//         if (message?.type === 'sys-reset') {
//           systemRef.current.reset();
//         } else if (message?.type === 'sys') {
//           handlePayload(message['payload']);
//         } else if (message?.type === 'sys-batch') {
//           message['payload'].forEach((messagePayload: unknown) => handlePayload(messagePayload));
//         }
//       }}
//     >
//       <DispatcherAndContextProvider systemRef={systemRef}>
//         {props.children}
//       </DispatcherAndContextProvider>
//     </KrmxProvider>
//   );
// }
//
// function DispatcherAndContextProvider(props: PropsWithChildren<{
//   systemRef: MutableRefObject<System<SystemState>>,
// }>) {
//   const { systemRef } = props;
//   const { username, send } = useKrmx();
//   const [state, setState] = useState(customSystem.system.initialState);
//   const [optimisticState, setOptimisticState] = useState(customSystem.system.initialState);
//   useEffect(() => {
//     systemRef.current.onChange((state) => setState(state));
//     systemRef.current.onOptimisticChange((state) => setOptimisticState(state));
//   }, []);
//   const dispatcher = (action: Action): boolean => {
//     if (systemRef.current.dispatch(username, action, true) === true) {
//       send(action);
//       return true;
//     }
//     return false;
//   };
//   return <SystemContext.Provider value={{
//     state,
//     optimisticState,
//     dispatcher,
//   }}>
//     {props.children}
//   </SystemContext.Provider>;
// }
