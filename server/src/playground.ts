// import { produceWithPatches, enablePatches } from 'immer';
import patch from 'json8-patch';
// // enablePatches();
//

console.info('hello, world!');

// TODO: array diffs are shitty! Find if a different library is available that is great at finding array diffs (is it worth? - computationally expensive)
const state = { name: 'lisa', age: 29, hobbies: ['tennis', 'netflix', { hello: 'world ' }], abc: { def: { ghi: 'jkl' } } };
const nextState = { name: 'lisa', age: 29, hobbies: ['tennis', 'netf', { hello: 'world' }], abc: { def: 'ghi' } };

const patches = patch.diff(state, nextState);
console.info('patches', patches);
// patch.apply(state, patches);
// console.info(state);
//
// const [, patches] = produceWithPatches(state, () => nextState);
// console.info(patches);
//
// const [, patchesWorks] = produceWithPatches(state, (draft) => {
//   draft.hobbies = [];
// });

// Chrome Test
// let ws;
// const join = () => {
//   ws = new WebSocket('ws://localhost:8082');
//   ws.onopen = () => console.info('--- open ---');
//   ws.onmessage = (data) => { const j = JSON.parse(data.data); console.info(j.type, JSON.stringify(j.payload)); };
//   ws.onclose = () => console.info('--- close ---');
// };
// join();
// const send = (m) => ws.send(JSON.stringify(m));
// const link = (name) => send({ type: 'krmx/link', payload: { username: name, version: '0.4.1' } });
//
// link('simon');
// send({ type: 'lobby/ready', payload: true });
// send({ type: 'lobby/change-starting-player', payload: 'simon' });
