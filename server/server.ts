import { createServer, Props } from '@krmx/server';
import { z } from 'zod';
import { System } from './system';

const system = new System({
  // people: [{ username: 'simon', color: 'red' }],
  counters: [0, 0, 0, 0, 0],
});
system.optimisticSeconds = 0.5;

// system.when(
//   'set-color',
//   z.string().trim().min(1),
//   (state, dispatcher, payload) => {
//     const index = state.people.findIndex((person) => person.username === dispatcher);
//     if (index !== -1) {
//       state.people[index].color = payload;
//     }
//   },
// );

system.when(
  'increment',
  z.object({
    counterIndex: z.number().min(0).max(4),
    amount: z.number().positive(),
  }),
  (state, _, payload) => {
    state.counters[payload.counterIndex] += payload.amount;
  },
);

// system.onChange((...all) => {
//   console.info('\n\n> new source');
//   console.info(...all);
// });
// system.onOptimisticChange((...all) => {
//   console.info('> optimistic');
//   console.info(...all);
// });

system.dispatch('root', { type: 'increment', payload: { counterIndex: 1, amount: 2 } }, false);
system.dispatch('root', { type: 'increment', payload: { counterIndex: 0, amount: 1 } }, true);
system.dispatch('root', { type: 'increment', payload: { counterIndex: 0, amount: 3 } }, true);
system.dispatch('root', { type: 'increment', payload: { counterIndex: 0, amount: 1 } }, false);
system.dispatch('root', { type: 'increment', payload: { counterIndex: 0, amount: 3 } }, false);
system.dispatch('root', { type: 'increment', payload: { counterIndex: 3, amount: 4 } }, true);
setTimeout(() => {
  system.dispatch('root', { type: 'increment', payload: { counterIndex: 3, amount: 1 } }, false);
}, 10000);

// const props: Props = { /* configure here */ };
// const server = createServer(props);
// // TODO: krmxSystemAdapter(server, ...)
//
// server.on('message', (username, message) => {
//   system.dispatch(username, message as { type: string, payload: unknown }, false);
// });
//
// system.onChange((dispatcher, type, payload) => {
//   server.broadcast({ origin: dispatcher, type, payload });
// });
//
// system
//
// server.listen(8082);
