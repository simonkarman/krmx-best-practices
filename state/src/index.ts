import { z } from 'zod';
import { KrmxState, ExtractView } from './lib/krmx-state';
export * from './lib/krmx-state';

export const state = new KrmxState();

type LobbyState = {
  players: { username: string, color: string, ready: boolean, secret: number }[],
  startingPlayer?: string,
};

const createPlayer = (username: string): LobbyState['players'][number] => {
  return { username, color: 'red', ready: false, secret: Math.floor(Math.random() * 10) + 1 };
};

const lobbyPhase = state.definePhase(
  'lobby',
  (): LobbyState => ({ players: [] }),
  (state: LobbyState, username) => ({
    self: state.players.find(p => p.username === username)!,
    players: state.players.map(({ username, color, ready }) => ({ username, color, ready })),
    startingPlayer: state.startingPlayer,
  }),
  {
    onJoin: (state, username) => {
      return state.players.push(createPlayer(username));
    },
    onLeave: (state, username) => state.players = state.players.filter(p => p.username !== username),
  },
);
export const lobbyPhaseTo = lobbyPhase.to.bind(lobbyPhase);
// export type LobbyView = ExtractView<typeof lobbyPhase>;
export const lobbyReadyAction = lobbyPhase.defineAction(
  'ready',
  z.boolean(),
  ({ state, initiator, payload }) => {
    const player = state.players.find(p => p.username === initiator);
    if (player === undefined) {
      return;
    }
    player.ready = payload;
  },
);
export const lobbyChangeStartingPlayerAction = lobbyPhase.defineAction(
  'change-starting-player',
  z.string().min(1),
  ({ state, payload }) => {
    const player = state.players.find(p => p.username === payload);
    if (player === undefined) {
      return;
    }
    state.startingPlayer = payload;
    player.ready = false;
  },
);
