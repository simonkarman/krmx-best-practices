import { z } from 'zod';
import { createServer } from '@krmx/server';
import { KrmxState } from './krmx-state';
import { attachTo } from './krmx-state-server';

// Create a new Krmx State object
const state = new KrmxState();

// Add a phase (this could be defined in a separate file!)
type LobbyPhaseState = { players: string[], numberOfCards: number };
// KrmxState.addPhase(...) returns a phase definition object, which can be used to define actions on and to switch to this phase
const lobbyPhase = state.definePhase(
  /* unique identifier of this phase (used in Krmx message protocol) */ 'lobby',
  /* a mapper that maps the data required to switch to this phase, to the server state */ (): LobbyPhaseState => ({ players: [], numberOfCards: 3 }),
  /* a mapper function that uniquely maps the user state to the state of a specific client */ (state: LobbyPhaseState, username: string) => state,
  /* callbacks that can alter the state whenever a Krmx event happens (join, leave, link, unlink) */ {
    onJoin: (state: LobbyPhaseState, clientName: string) => {  }
  }
);

// Optional: (?) add cardGame.addUniformPhase(...) that adds a phase in which the state is shared by server and client

const lobbyIncreaseAction = lobbyPhase.defineAction('increase', z.number().min(1), ({ state, initiator, payload, switchPhase }) => {
  state.numberOfCards += payload - initiator.length;
  if (state.numberOfCards >= 8) {
    switchPhase(lobbyPhase.to(undefined));
  }
});
//   /* other optional props for an action */ {
//   /* by whom this action can be undone (only if it was the last action that was executed on the state) */ undoable: 'self', // 'none' | 'self' | 'other' | 'any' | (state: LobbyPhaseState, doer: string, undoer: string) => void
// });
const lobbyIncrease = lobbyIncreaseAction(4); // === { type: 'lobby/increase', payload: 4 }

const server = createServer();
// const cardGameServer =
attachTo(
  /* the krmx server to attach to */ server, // functionality:
                                             // (1) will send current phase and state whenever a client links
                                             // (2) will fire phase callbacks when clients join, leave, link, or unlink
                                             // (3) will listen to '<phases>/<action>' messages arriving at the server and try to handle them
                                             // (4) will send patches to clients anytime their state changes
                                             // (5) will communicate phase changes
  state,
  /* the initial phase to activate */ lobbyPhase.to(undefined),
  // /* other configuration for state */ {
  //   saveServerStateToFile: 'output/state.json',
  // },
);
server.on('listen', (port) => { console.info(`server started on port`, port); })
server.listen();


// cardGameServer.send('simon', lobbyIncreaseAction(2));
// const cardGameClient = cardGame.viewUsing(client);
