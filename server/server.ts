import { createServer, Props } from '@krmx/server';
import { z } from 'zod';
import { System } from './system';

const system = new System({
  people: [{ username: 'simon', color: 'red' }],
  counters: [0, 1, 2, 3, 4],
});

system.addAction('set-color', z.string().trim().min(1), (state, initiator, payload) => {
  const index = state.people.findIndex((person) => person.username === initiator);
  if (index !== -1) {
    state.people[index].color = payload;
  }
});

const props: Props = { /* configure here */ };
const server = createServer(props);
// TODO: krmxSystemAdapter(server, ...)

server.on('message', (username, message) => {
  system.dispatch(username, message as { type: string, payload: unknown });
});

server.listen(8082);
