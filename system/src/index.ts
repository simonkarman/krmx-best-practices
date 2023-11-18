import { z } from 'zod';
import { System } from './system';

const system = new System({ counter: 0, additional: { data: [3, 4, 5] } });
const increment = system.when('increment', z.number().min(1), (state, dispatcher, payload) => {
  state.counter += payload;
});
const decrement = system.when('decrement', z.number().min(1), (state, dispatcher, payload) => {
  state.counter -= payload;
});
export { system, increment, decrement };

// TODO: move somewhere else?
export * from './system';

// TODO: do we really need these type exports?
const actions = [increment, decrement];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action = typeof actions extends (infer T extends (...any: any) => any)[] ? ReturnType<T> : never;
export type SystemState = typeof system extends System<infer X> ? X : never;
