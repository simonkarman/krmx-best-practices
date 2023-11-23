import { z } from 'zod';
import { System } from './system';

export const system = new System({ counter: 0, joiners: [] as string[] });
export const root = '<root>';
export const joiner = system.when('joiner', z.string().min(3), (state, dispatcher, payload) => {
  if (dispatcher === root) {
    if (state.joiners.indexOf(payload) === -1) {
      state.joiners.push(payload);
    }
  }
});
export const increment = system.when('increment', z.number().min(1), (state, dispatcher, payload) => {
  state.counter += payload;
});
export const decrement = system.when('decrement', z.number().min(1), (state, dispatcher, payload) => {
  state.counter -= payload;
});

// TODO: move somewhere else?
export * from './system';

// TODO: do we really need these type exports?
const actions = [increment, decrement];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action = typeof actions extends (infer T extends (...any: any) => any)[] ? ReturnType<T> : never;
export type SystemState = typeof system extends System<infer X> ? X : never;
