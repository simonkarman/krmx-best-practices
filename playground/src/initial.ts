/* eslint-disable @typescript-eslint/no-unused-vars */
// export class ClientContext<State, Events> {
//   state: State;
//
//   constructor(initialState: State) {
//     this.state = initialState;
//   }
// }
//
// export class ServerContext<State, Events> {
//   state: State;
//
//   constructor(initialState: State) {
//     this.state = initialState;
//   }
// }
//
// export class Application {
//
//   on<T>(eventName: T, payloadSchema: U, handle: {
//
//   }): () => { type: T, payload: U } {
//
//   }
// }

import { z, ZodAny, ZodAnyDef, ZodType, ZodUndefined } from 'zod';

// server state
// const serverState = {
//   turn: 'simon',
//   hands: { 'simon': [1, 4], 'lisa': [0, 3, 8] } as { [username: string]: number[] },
//   deck: [2, 5, 6, 7],
//   pile: [9],
// };
// type ServerState = typeof serverState;
//
// // client states
// const clientSimonState = {
//   me: 'simon',
//   turn: 'simon',
//   hand: [1, 4],
//   handSizes: { 'simon': 2, 'lisa': 3 } as { [username: string]: number },
//   deckSize: 4,
//   pile: [9],
// };
// type ClientState = typeof clientSimonState;
// const clientLisaState: ClientState = {
//   me: 'lisa',
//   turn: 'simon',
//   hand: [0, 3, 8],
//   handSizes: { 'simon': 2, 'lisa': 3 } as { [username: string]: number },
//   deckSize: 4,
//   pile: [9],
// };
//
// // client actions
// type Draw = { type: 'draw' }; // client to server (not optimistic)
// type Play = { type: 'play', payload: number }; // client to server (optimistic possible)
// type ClientAction = Draw | Play;
//
// // server actions
// type CardDrawn = { type: 'cardDrawn', payload: number }; // dm
// type Drawn = { type: 'drawn', payload: string }; // broadcast
// type Played = { type: 'played', payload: { player: string, card: number } }; // broadcast
// type ServerAction = CardDrawn | Drawn | Played;
//
// // server handlers (for client actions)
// type Actor = { name: string };
// type ServerOn<Action extends ClientAction> = (
//   actor: Actor,
//   payload: Action extends { 'payload': infer Payload } ? Payload : never,
//   emitTo: (to: '*' | Actor | Actor[], serverAction: ServerAction) => void,
//   state: ServerState,
// ) => void;
// const serverOnDraw: ServerOn<Draw> = (actor, _, emitTo, state) => {
//   if (state.turn !== actor.name) { return; }
//   const card = serverState.deck.pop();
//   if (!card) { return; }
//   state.hands[actor.name].push(card);
//   emitTo(actor, { type: 'cardDrawn', payload: card });
//   emitTo('*', { type: 'drawn', payload: actor.name });
// };
// const serverOnPlay: ServerOn<Play> = (actor, card, emitTo, state) => {
//   if (
//     !state.hands[actor.name].includes(card) // player must have that card
//     || state.turn !== actor.name // player must be in turn
//   ) {
//     return;
//   }
//   state.pile.push(card);
//   state.hands[actor.name] = state.hands[actor.name].filter(card => card !== card);
//   emitTo(actor, { type: 'played', payload: { player: actor.name, card: card } });
// };
//
// // client handlers
// type ClientOn<Action extends ServerAction> = (
//   payload: Action extends { 'payload': infer Payload } ? Payload : never,
//   state: ClientState,
// ) => void;
// const clientOnCardDrawn: ClientOn<CardDrawn> = (card, state) => {
//   state.hand.push(card);
// };
// const clientOnDrawn: ClientOn<Drawn> = (name, state) => {
//   state.deckSize -= 1;
//   state.handSizes[name] += 1;
// };
// const clientOnPlayed: ClientOn<Played> = (payload, state) => {
//   if (payload.player === state.me) {
//     state.hand = state.hand.filter(card => card !== payload.card);
//   }
//   state.handSizes[payload.player] -= 1;
//   state.pile.push(payload.card);
// };

// class Application<ServerAction, ClientAction> {
//   constructor(onServer: Map<ServerAction['type'], OnServer>) {
//   }
// }

type Message = { type: string };
// type Message<Payload> = Payload extends undefined ? { type: string } : { type: string, payload: Payload }
/**
 * An action represents an ability of a client to alter the server state.
 */
type Action<ServerState> = {
  type: string,
  payloadSchema: ZodAny,
  serverHandler(props: {
    state: ServerState,
    initiator: string,
    payload: ZodAnyDef,
  }): void,
}; // TODO: define additional information of client action

class Client<ServerState, ClientState> {
  // TODO: we shouldn't pass a reference to core as it's field cannot be accessed since they're private. The references we specifically need from core
  //       should be passed here individually.
  constructor(
    sendToServer: (action: Message) => void,
  ) {}

  // TODO: can we somehow restrict the actions a client can take, based on the client actions added to the core?
  // For now the provider methods returned by the addClientAction can be used to construct the actions in a type safe manner
  takeAction(action: Message<any>): void {
    // TODO: if we want optimistic updates, this is where we should do it.
  }

  handleServerEvent(event: Message<any>) {

  }
}

class Server<ServerState, ClientState> {
  // TODO: do we want to keep track of this server side? private readonly clientStates: { [username: string]: ClientState } = {};
}

interface Builder<Output> {
  build(): Output;
}

interface DefinerWith<Output, Input> {
  define(input: Input): Output;
}

class Phase<ServerState, ClientState> {
  constructor(
    private readonly serverState: ServerState,
    private readonly mapToClientState: (serverState: ServerState, clientName: string) => ClientState,
    private readonly actions: { [type: string]: Action<ServerState> },
  ) {}
}

class PhaseDefinition<ServerState, ClientState> implements DefinerWith<Phase, ServerState>{
  constructor(
    private readonly mapToClientState: (serverState: ServerState, clientName: string) => ClientState,
    private readonly actions: { [type: string]: Action<ServerState> },
  ) {}

  define(serverState: ServerState): Phase<ServerState, ClientState> {
    return new Phase(serverState, this.mapToClientState, this.actions);
  }
}

export class PhaseDefinitionBuilder<ServerState, ClientState> implements Builder<PhaseDefinition<ServerState, ClientState>> {
  private readonly actions: { [type: string]: Action<ServerState> } = {};
  constructor(
    private readonly mapToClientState: (serverState: ServerState, clientName: string) => ClientState,
  ) {}

  /**
   * Registers an action that a client can take.
   *
   * Allows you to provide a zod schema, if the action sent does not adhere to the schema (validation will happen on both client and server side), the
   *   action is discarded.
   * TODO: Allows you to supply a verify function (that can access clientState and the provided action). When the verify function returns false, the action
   *   is not sent.
   * TODO: Allows you to provide a server handler. This handler is executed on the server, and is allowed to alter the server state. The handler has access
   *   to the action, the serverState, the username of the client that dispatched the action, and a dispatch function that allows for dispatching
   *   server events to one or more clients.
   * Returns a method that can be used to construct the action in a type safe way.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerAction<Type extends string, PayloadSchema extends ZodType<any, any, any>>(
    type: Type,
    payloadSchema: PayloadSchema,
    serverHandler: (props: {
      state: ServerState,
      initiator: string,
      payload: z.infer<PayloadSchema>,
      // TODO: pass a 'switchPhase' callback
    }) => void,
  ):
    PayloadSchema extends ZodUndefined
      ? () => { type: Type, payload: undefined }
      : (payload: z.infer<PayloadSchema>) => { type: Type, payload: z.infer<PayloadSchema> } {
    // TODO: don't allow after start
    if (type in this.actions) {
      throw new Error(`cannot register client action '${type}' as a client action with that type has already been registered`);
    }
    // TODO: assume no longer needed, as we will prefix all actions with the phase prefix
    // if (type.startsWith('krmx/')) {
    //   throw new Error('cannot register a client action that start with \'krmx/\' as this prefix is reserved for internal usage');
    // }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.actions[type] = { type, payloadSchema, serverHandler } as any;

    // @ts-expect-error as payload parameter could be undefined
    return (payload) => ({ type, payload });
  }

  build(): PhaseDefinition<ServerState, ClientState> {
    return new PhaseDefinition<ServerState, ClientState>(this.mapToClientState, this.actions);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPhaseDefinition = PhaseDefinition<any, any>;

export class Orchestrator {
  private started: boolean = false;
  private currentPhase: AnyPhase | undefined;
  constructor(private readonly phaseDefinitions: AnyPhaseDefinition[]) {
  }

  // TODO: Don't do anything until orchestrator is started, with the start phase
  start(startPhase: AnyPhase) {
    this.started = false;
    this.currentPhase = startPhase;
  }
}

export class OrchestratorBuilder {
  private phaseConstructors: { [name: string]: (props: any) => AnyPhase } = {};
  // private currentPhase: AnyPhase | undefined;

  // TODO: on join / leave
  // TODO: on link communicate current phase

  // TODO: don't add a default phase, but just don't do anything until orchestrator is started
  registerPhase<InitializingProps, ServerState, ClientState>(
    name: string,
    constructor: (props: InitializingProps) => Phase<ServerState, ClientState>,
  ): (props: InitializingProps) => { name: string, props: InitializingProps } {
    if (name in this.phaseConstructors) {
      throw new Error(`cannot register phase '${name}' as a phase with that name has already been registered`);
    }
    this.phaseConstructors[name] = constructor;
    return (props) => ({ name, props });
  }

  switchPhase<T>(switchTo: { name: string, props: T }): void {
    if (!this.started) {
      throw new Error(`cannot switch phase '${switchTo.name}' as the orchestrator has not yet started`);
    }
    const phaseConstructor = this.phaseConstructors[switchTo.name];
    // TODO: communicate phase switch to all clients
    const nextPhase = phaseConstructor(switchTo.props);
    // TODO: should we 'close'/'end' the previous phase?
    this.currentPhase = nextPhase;
  }

  // TODO: eject client should receive parameters for what we need to setup a client
  ejectClient(): Client<ServerState, ClientState> {
    return new Client(this);
  }

  // TODO: eject server should receive parametesr for what we need to setup a server
  ejectServer(): Server<ServerState, ClientState> {
    return new Server();
  }
}

// TODO: should we use an abstract Core class to ensure join and leave implementations?
// class MyCore<C, S> extends Core<C, S> {
// }

// TODO: ensure that core server can link and unlink clients, based on when a Krmx client links or unlinks. And that the link and unlink actions are
//       always present. -> behaviour should be configurable per phase
// TODO: Create join/leave actions for clients, ensure these are required (per phase).
type InGamePhaseState = { activePlayer: string, deck: number[], players: { [player: string]: { hand: number[] } } };
const inGamePhaseDefinitionBuilder = new PhaseDefinitionBuilder((serverState: InGamePhaseState, clientName) => {
  // TODO: if client state doesn't change, don't emit change events
  // TODO: check that changes emitted only cover the changes and are not a completely new state
  return {
    activePlayer: serverState.activePlayer,
    deckSize: serverState.deck.length,
    hand: serverState.players[clientName].hand,
  };
});

// TODO: how should draw be usable from outside?
const draw = inGamePhaseDefinitionBuilder.registerAction('draw', z.undefined(), ({ state, initiator }) => {
  const card = state.deck.pop();
  if (card === undefined) {
    // TODO: how should we handle logical 'errors' or other undesired behaviour? In this case the action is simply ignored, do we want to notify the
    //       client of why?
    return; // no cards left in the deck
  }
  state.players[initiator].hand.push(card);
  // TODO: Use a map function that takes the server state and the clientName. It will be invoked for each client and using immer, only if anything for
  //       that client has changed, the patches are forwarded.
  if (state.deck.length === 0) {
    switchTo(lobbyPhase());
  }
});


const orchestrator = new Orchestrator();

// TODO: being able to create phases (such as lobby phase and in-game phase) should be part of the framework immediately.
orchestrator.registerPhase('in-game', (props: { players: string[] }) => {
  const players = props.players; // TODO: shuffle
  const phase = inGamePhase new Phase(
    {
      activePlayer: players[0],
      deck: [0, 1, 2, 3],
      players: {},
    } as ServerState,
    ,
  );
  return phase;
});

orchestrator.start(lobbyPhase());
orchestrator.ejectClient().takeAction(draw());

// in krmx server
// const server = myCore.ejectServer(krmxServer);

// in krmx client
// const client = myCore.ejectClient(krmxClient);

// ignore @typescript-eslint/no-explicit-any
// declare const Application: any;

// describe
//

// // client
// const application = new Application('simon');
// application.subscribe((clientState) => {});
// application.dispatch({ type: 'draw' });
//
// // server
// const application = new Application();
