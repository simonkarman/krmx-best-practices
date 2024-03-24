// import { produceWithPatches, enablePatches } from 'immer';
// import patch from 'json8-patch';
// // enablePatches();
//
import { diff, patch } from 'jsondiffpatch';
import { hello } from './two.ts';

// console.info('hello, world!');
//

const state = { name: 'lisa', age: 29, hobbies: ['tennis', 'netflix', hello], a: { nested: { object: 'here' } } };
const nextState = { name: 'lisa', age: 29, hobbies: ['tennis'], a: { nested: 'shorter' } };

const delta = diff(state, nextState);
const nextStatePatched = patch(state, delta);

console.info('delta---->', JSON.stringify(delta));
console.info('patched-->', JSON.stringify(nextStatePatched));
console.info('original->', JSON.stringify(nextState));
//
// const patches = patch.diff(state, nextState);
// console.info('patches', patches);
// patch.apply(state, patches);
// console.info(state);
//
// const [, patches] = produceWithPatches(state, () => nextState);
// console.info(patches);
//
// const [, patchesWorks] = produceWithPatches(state, (draft) => {
//   draft.hobbies = [];
// });
