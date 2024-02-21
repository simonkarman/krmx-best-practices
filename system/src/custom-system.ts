import { z } from 'zod';
import { System } from './utils/system';
export const ROOT_DISPATCHER = '<ROOT_DISPATCHER>';

export const createCustomSystem = () => {
  const system = new System({ counter: 0, joiners: [] as string[] });

  const joiner = system.when('joiner', z.string().min(3), (state, dispatcher, payload) => {
    if (dispatcher === ROOT_DISPATCHER) {
      if (state.joiners.indexOf(payload) === -1) {
        state.joiners.push(payload);
      }
    }
  });

  const increment = system.when('increment', z.number().min(1), (state, _, payload) => {
    state.counter += payload;
  });
  const decrement = system.when('decrement', z.number().min(1), (state, _, payload) => {
    state.counter -= payload;
  });

  const actions = [joiner, increment, decrement] as const;

  return { system, joiner, increment, decrement, actions };
};
