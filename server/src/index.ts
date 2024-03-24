import { createServer } from '@krmx/server';
import { lobbyPhaseTo, state } from 'state';
import { attachTo } from './lib/krmx-state-server.ts';

const server = createServer();
attachTo(server, state, lobbyPhaseTo(undefined));
server.listen(8082);
