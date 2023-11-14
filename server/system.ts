import { produce } from 'immer';
import { z, ZodAny, ZodAnyDef, ZodType } from 'zod';
import { createHash } from 'crypto';

type Subscription<State> = (state: State, dispatcher: string, type: string, payload: unknown) => void;
type OptimisticSubscription<State> = (state: State) => void;

export class System<State> {
  private actionDefinitions: {
    [type: string]: {
      payloadSchema: ZodAny
      handler: <T extends State>(state: T, dispatcher: string, payload: ZodAnyDef) => T | void, // TODO: what if this fails?
    }
  } = {};

  private sourceState: State;
  private subscriptions: Subscription<State>[] = [];

  private optimisticEvents: { hash: string, dispatcher: string, message: { type: string, payload: unknown }, timestamp: number }[] = [];
  private optimisticState: State;
  private optimisticSubscriptions: OptimisticSubscription<State>[] = [];
  public optimisticSeconds = 10;

  constructor(initialState: State) {
    this.sourceState = produce(initialState, () => {});
    this.optimisticState = this.sourceState;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  when<PayloadSchema extends ZodType<any, any, any>>(
    type: string,
    payloadSchema: PayloadSchema,
    handler: (state: State, dispatcher: string, payload: z.infer<PayloadSchema>) => State | void,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.actionDefinitions[type] = { payloadSchema, handler } as any;
  }

  dispatch(dispatcher: string, message: { type: string, payload: unknown }, isOptimistic: boolean) {
    const generateHashOfEvent = () => {
      const hash = createHash('sha256');
      hash.update(JSON.stringify({ dispatcher, message }));
      return hash.digest('hex');
    };
    console.info('\n\n');

    // get the action definition corresponding to the dispatched message
    const actionDefinition = this.actionDefinitions[message.type];
    if (actionDefinition === undefined) {
      return;
    }

    // verify the payload is valid based on the schema of the action definition for this message
    const payload = actionDefinition.payloadSchema.safeParse(message.payload);
    if (!payload.success) {
      return;
    }

    // first, we can prune all optimistic updates that are too old and are thus no longer relevant
    const now = Date.now();
    console.info('at', now);
    this.optimisticEvents = this.optimisticEvents.filter(event => now < event.timestamp);

    if (isOptimistic) {
      // if optimistic -- this state change might happen in the future

      // so, leave the source state as is and only update the optimistic state
      this.optimisticState = produce(this.optimisticState, (_state: State) => {
        return actionDefinition.handler(_state, dispatcher, payload.data);
      });

      // and save the dispatched event in a list for future reference for X seconds
      const MILLISECONDS_IN_ONE_SECOND = 1000;
      this.optimisticEvents.push({
        hash: generateHashOfEvent(),
        dispatcher,
        message,
        timestamp: Date.now() + (MILLISECONDS_IN_ONE_SECOND * this.optimisticSeconds),
      });
    } else {
      // if non-optimistic -- this state change has been verified to actually happen

      // so, let's apply it to the source state (and reset the optimistic state to it)
      this.sourceState = produce(this.sourceState, (_state: State) => {
        return actionDefinition.handler(_state, dispatcher, payload.data);
      });
      this.optimisticState = this.sourceState;

      // and broadcast changes to the source state
      this.subscriptions.forEach(subscription => {
        subscription(this.sourceState, dispatcher, message.type, payload.data);
      });

      // now, if there are any optimistic updates ...
      if (this.optimisticEvents.length > 0) {

        // if the event we just applied to the source state is in the optimistic list, remove it, as it has actually happened!
        const _hash = generateHashOfEvent();
        const index = this.optimisticEvents.findIndex(event => event.hash === _hash);
        if (index !== -1) {
          this.optimisticEvents.splice(index, 1);
        }

        // but, do replay the remaining optimistic events as we're still expecting these to happen in the future
        this.optimisticEvents.forEach(event => {
          this.optimisticState = produce(this.optimisticState, (_state: State) => {
            return actionDefinition.handler(_state, dispatcher, payload.data);
          });
        });
      }
    }

    // finally, as the optimistic state always changes, we should always broadcast to the subscriptions after each dispatch
    this.optimisticSubscriptions.forEach(subscription => {
      subscription(this.optimisticState);
    });

    console.info('>>', isOptimistic ? 'optimistic' : 'verified', 'event:', message.type + '->' + JSON.stringify(message.payload));
    console.info('>= source state', this.sourceState);
    if (this.optimisticEvents.length > 0) {
      console.info(`>? optimistic (${this.optimisticEvents.length}):`,
        this.optimisticEvents.map(event => `\n  - ${event.timestamp} (${event.timestamp - Date.now()}): ${event.message.type}`).join(''),
        '\n>??=', this.optimisticState,
      );
    }
  }

  onChange(subscription: Subscription<State>) {
    this.subscriptions.push(subscription);
  }

  onOptimisticChange(subscription: OptimisticSubscription<State>) {
    this.optimisticSubscriptions.push(subscription);
  }
}
