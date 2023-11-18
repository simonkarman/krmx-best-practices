import { createServer, Props } from '@krmx/server';
import { system } from 'system';

const props: Props = { /* configure here */ };
const server = createServer(props);

system.onChange(console.info);

// TODO: keep track of all dispatched messages including username and timestamp
// TODO: on link send all previously dispatched messages first as a sys-batch message (per X message to avoid frame size limits of websockets)
// TODO: on shutdown, save all dispatched messages to a history file for re-watch functionality

server.on('message', (username, message) => {
  console.info(username, message);
  if (system.dispatch(username, message) === true) {
    const broadcastMessage = {
      type: 'sys',
      payload: {
        dispatcher: username,
        ...message,
        // TODO: every X updates include a hash of the state to the client, to verify state equality
        hash: undefined,
      },
    };
    console.info(broadcastMessage);
    server.broadcast(broadcastMessage);

  }
});

server.listen(8082);