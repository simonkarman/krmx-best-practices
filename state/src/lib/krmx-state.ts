import { z, ZodAny, ZodAnyDef, ZodType, ZodUndefined } from 'zod';

export const KrmxStatePrefix = 'krmx-state';

function isValidKrmxIdentifier(identifier: string): boolean {
  return identifier !== 'krmx' && identifier !== KrmxStatePrefix && !identifier.includes('/');
}

function assertValidKrmxIdentifier(identifier: string): void {
  if (!isValidKrmxIdentifier(identifier)) {
    const information = `ensure it doesn't contain a '/' character and that it isn't equal to the reserved keyword 'krmx' or '${KrmxStatePrefix}'`;
    throw new Error(`identifier '${identifier}' is not a valid krmx identifier -- ${information}`);
  }
}

type KrmxCallback<State> = (state: State, username: string) => void;

type ActionDefinition<State> = {
  identifier: string,
  payloadSchema: ZodAny,
  serverHandler(props: {
    state: State,
    initiator: string,
    payload: ZodAnyDef,
    switchPhase: (to: { phase: string, origin: any }) => void, // -- allows switching the Krmx state to another phase
    // TODO: add chainAction() -- allows handling another action immediately as part of this action's execution
  }): void,
  // TODO: add optimisticHandler
};

class PhaseDefinition<PhaseIdentifier extends string = any, Origin = any, State = any, View = any> {
  private extracted: boolean = false;
  private readonly actions: Map<string, ActionDefinition<State>> = new Map();

  constructor(
    private readonly identifier: PhaseIdentifier,
    private readonly originMapper: (origin: Origin) => State,
    private readonly viewMapper: (serverState: State, username: string) => View,
    private readonly krmxCallbacks: {
      onJoin?: KrmxCallback<State>, onLeave?: KrmxCallback<State>,
      onLink?: KrmxCallback<State>, onUnlink?: KrmxCallback<State>,
    },
  ) {}

  to(origin: Origin): { phase: string, origin: Origin } {
    return { phase: this.identifier, origin };
  }

  defineAction<Identifier extends string, Schema extends ZodType<any, any, any>>(
    identifier: Identifier,
    payloadSchema: Schema,
    serverHandler: (props: {
      state: State,
      initiator: string,
      payload: z.infer<Schema>,
      switchPhase: (to: { phase: string, origin: any }) => void,
    }) => void,
  ):
    Schema extends ZodUndefined
      ? () => { identifier: `${PhaseIdentifier}/${Identifier}`, payload: undefined }
      : (payload: z.infer<Schema>) => { identifier: `${PhaseIdentifier}/${Identifier}`, payload: z.infer<Schema> } {
    if (this.extracted) {
      throw new Error('cannot define a new action when the phase has already been extracted');
    }
    assertValidKrmxIdentifier(identifier);
    if (this.actions.has(identifier)) {
      throw new Error(`cannot define an action with identifier '${identifier}', `
        + `as an action with that identifier has already been defined within the '${this.identifier}' phase`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.actions.set(identifier, { identifier, payloadSchema: (payloadSchema as unknown as ZodAny), serverHandler });

    // @ts-expect-error as payload parameter could be undefined
    return (payload: z.infer<Schema>) => ({ identifier: `${this.identifier}/${identifier}`, payload });
  }

  _extract() {
    this.extracted = true;
    return {
      identifier: this.identifier,
      originMapper: this.originMapper,
      viewMapper: this.viewMapper,
      krmxCallbacks: this.krmxCallbacks,
      actions: this.actions,
    };
  }
}

export type ExtractView<T> = T extends PhaseDefinition<any, any, any, infer R> ? R : never;

export class KrmxState {
  private extracted: boolean = false;
  private readonly phaseDefinitions: Map<string, PhaseDefinition> = new Map<string, PhaseDefinition>();

  // TODO: should definePhase just take the phaseDefinition as a parameter, so the caller can construct it without needing access to the state?
  definePhase<PhaseIdentifier extends string, Origin, State, View>(
    identifier: PhaseIdentifier,
    originMapper: (origin: Origin) => State,
    viewMapper: (serverState: State, viewer: string) => View,
    krmxCallbacks?: {
      onJoin?: KrmxCallback<State>, onLeave?: KrmxCallback<State>,
      onLink?: KrmxCallback<State>, onUnlink?: KrmxCallback<State>,
    },
  ): PhaseDefinition<PhaseIdentifier, Origin, State, View> {
    if (this.extracted) {
      throw new Error('cannot define a new phase when the state has already been extracted');
    }
    assertValidKrmxIdentifier(identifier);
    if (this.phaseDefinitions.has(identifier)) {
      throw new Error(`cannot define a phase with identifier '${identifier}', as a phase with that identifier has already been defined`);
    }
    const phaseDefinition = new PhaseDefinition<PhaseIdentifier, Origin, State, View>(
      identifier,
      originMapper,
      viewMapper,
      krmxCallbacks ?? {},
    );
    this.phaseDefinitions.set(identifier, phaseDefinition);
    return phaseDefinition;
  }

  _extract() {
    this.extracted = true;
    return { phaseDefinitions: this.phaseDefinitions };
  }
}
