import { produce } from 'immer';
import { z, ZodAny, ZodAnyDef, ZodType } from 'zod';

export class System<State> {
  private currentState: State;
  private actionDefinitions: {
    [type: string]: {
      payloadSchema: ZodAny
      handler: <T extends State>(state: T, initiator: string, payload: ZodAnyDef) => T | void,
    }
  } = {};

  constructor(initialState: State) {
    this.currentState = produce(initialState, () => {
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addAction<PayloadSchema extends ZodType<any, any, any>>(
    type: string,
    payloadSchema: PayloadSchema,
    handler: (state: State, initiator: string, payload: z.infer<PayloadSchema>) => State | void,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.actionDefinitions[type] = { payloadSchema, handler } as any;
  }

  dispatch(initiator: string, message: { type: string, payload: unknown }) {
    const actionDefinition = this.actionDefinitions[message.type];
    if (actionDefinition === undefined) {
      return;
    }
    const payload = actionDefinition.payloadSchema.safeParse(message.payload);
    if (payload.success) {
      this.currentState = produce(this.currentState, (_state: State) => {
        return actionDefinition.handler(_state, initiator, payload.data);
      });
    }
  }
}
