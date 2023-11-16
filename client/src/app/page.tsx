'use client';
import { KrmxLayer, useSystem } from '@/components/layer';
import { useKrmx } from '@krmx/client';
import { decrement, increment } from 'system';

export default function MyApp() {
  return (
    <KrmxLayer>
      <MyComponent />
    </KrmxLayer>
  );
}

function MyComponent() {
  const { isConnected, isLinked, link, rejectionReason, send, leave, users } = useKrmx();
  if (!isConnected) {
    // Your logic for when you're not connected to the server goes here
    return <p>No connection to the server...</p>;
  }
  if (!isLinked) {
    // Your logic for linking your connection with a user goes here
    return (
      <div>
        <button onClick={() => link('simon')}>Join!</button>
        {rejectionReason && <p>Rejected: {rejectionReason}</p>}
      </div>
    );
  }
  // Your logic for when you're ready to go goes here
  return (
    <div>
      <p>
        Welcome <strong>simon</strong>!
      </p>
      <button onClick={() => send({ type: 'custom/hello' })}>Send custom/hello</button>
      <button onClick={leave}>Leave</button>
      <h2>Users</h2>
      <ul>
        {Object.entries(users)
          .map(([otherUsername, { isLinked }]) => (
            <li key={otherUsername}>
              {isLinked ? '🟢' : '🔴'} {otherUsername}
            </li>),
          )}
      </ul>
      <SystemViewer />
    </div>
  );
}

function SystemViewer() {
  const { state, optimisticState, dispatcher } = useSystem();
  return <div className='m-2 shadow px-4 py-2 bg-amber-100 border border-black rounded-lg'>
    <h1 className='font-bold text-xl mt-2 border-b border-black mb-1'>Dispatchers</h1>
    <div className='flex gap-4'>
      <button className='p-2 border border-black rounded bg-green-300' onClick={() => dispatcher(increment(1))}>Increment</button>
      <button className='p-2 border border-black rounded bg-red-300' onClick={() => dispatcher(decrement(1))}>Decrement</button>
    </div>
    <div className='flex gap-4 text-center'>
      <div>
        <h1 className='font-bold text-xl mt-4 border-b border-black mb-1'>State</h1>
        <pre>{state.counter}</pre>
      </div>
      <div>
        <h1 className='font-bold text-xl mt-4 border-b border-black mb-1'>Optimistic State</h1>
        <pre>{optimisticState.counter}</pre>
      </div>
    </div>
  </div>;
}
