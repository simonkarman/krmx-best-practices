import { createServer, Message, Props } from '@krmx/server';
import { createHash } from 'crypto';
import { joiner, root, system } from 'system';

const BATCH_SIZE = 100;

const props: Props = { /* configure here */ };
const server = createServer(props);

type SysMessagePayload = {
  dispatcher: string,
  hash?: string,
} & Message;

interface SysMessage {
  type: 'sys',
  payload: SysMessagePayload,
}
interface BatchSysMessage {
  type: 'sys-batch',
  payload: SysMessagePayload[],
}

// Keep track of all dispatched messages (including username and timestamp)
const history: SysMessagePayload[] = [];

// On link send all previously dispatched messages first as a sys-batch message (per X message to avoid frame size limits of websockets)
server.on('link', (username) => {
  server.send(username, { type: 'sys-reset' });
  for (let i = 0; i < history.length; i += BATCH_SIZE) {
    const batchSysMessage: BatchSysMessage = {
      type: 'sys-batch',
      payload: history.slice(i, i + BATCH_SIZE),
    };
    server.send(username, batchSysMessage);
  }
});

// Keep track of a history of hashes of the state
const hashHistory: string[] = [];
system.onChange((state) => {
  if (history.length % BATCH_SIZE === 0) {
    hashHistory.push(createHash('sha256').update(JSON.stringify(state)).digest('hex'));
  }
});

// When dispatch a message, verify it against the system and broadcast on success
const dispatchMessage = (username: string, message: Message) => {
  if (system.dispatch(username, message) === true) {
    const payload: SysMessagePayload = {
      dispatcher: username,
      ...message,
      // Every X updates include a hash of the state to the client, to verify state equality
      hash: history.length % BATCH_SIZE === 0 ? hashHistory[hashHistory.length - 1] : undefined,
    };
    history.push(payload);

    const sysMessage: SysMessage = {
      type: 'sys',
      payload,
    };
    server.broadcast(sysMessage);
  }
};

// Directly try and dispatch client messages
server.on('message', dispatchMessage);

// Do server specific functionality
server.on('join', (username) => {
  dispatchMessage(root, joiner(username));
});

// TODO: on shutdown, save all dispatched messages to a history file for re-watch functionality

server.listen(8082);
