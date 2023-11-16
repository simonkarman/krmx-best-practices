import { z } from 'zod';
import { System } from './system';

const system = new System({ counter: 0 });
const increment = system.when('increment', z.number().min(1), (state, dispatcher, payload) => {
  state.counter += payload;
});
const decrement = system.when('decrement', z.number().min(1), (state, dispatcher, payload) => {
  if (dispatcher === 'admin') {
    state.counter -= payload;
  }
});
export { system, increment, decrement };
