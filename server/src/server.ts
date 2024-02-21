import { Message, Server } from '@krmx/server';
import { createCustomSystem, ROOT_DISPATCHER } from 'system';

// Create the custom system
export const customSystem = createCustomSystem();

// Configuration
export const PORT = 8082; // -- the port number at which the server will start
export const HISTORY_FILE_NAME: string | undefined = './output/last-run.json'; // -- set to undefined if you want to disable auto safe/load functionality
export const BATCH_SIZE = 100; // -- the number of message to collect into one batch

// Custom Setup
export const setup = (server: Server, dispatchMessage: (dispatcher: string, message: Message) => void) => {
  server.on('join', (username) => {
    dispatchMessage(ROOT_DISPATCHER, customSystem.joiner(username));
  });
};
