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
  return (<>
    <div className='m-2 shadow px-4 py-2 bg-amber-100 border border-black rounded-lg'>
      <h2 className='text-xl mt-2 mb-2'>
        Welcome <strong>simon</strong>!
      </h2>
      <div className='flex gap-4'>
        <button className='px-2 py-1 border border-black rounded bg-blue-300' onClick={() => send({ type: 'custom/hello' })}>
          Send custom/hello
        </button>
        <button className='px-2 py-1 border border-black rounded bg-red-300' onClick={leave}>
          Leave
        </button>
      </div>
      <h2 className='font-bold text-xl mt-2 border-b border-black mb-1'>Users</h2>
      <ul className='flex gap-4'>
        {Object.entries(users)
          .map(([otherUsername, { isLinked }]) => (
            <li key={otherUsername}>
              {isLinked ? '🟢' : '🔴'} {otherUsername}
            </li>),
          )}
      </ul>
    </div>
    <SystemViewer />
  </>);
}

function SystemViewer() {
  const { state, optimisticState, dispatcher } = useSystem();
  return <>
    <div className='m-2 shadow px-4 py-2 bg-amber-100 border border-black rounded-lg'>
      <h2 className='font-bold text-xl mt-2 border-b border-black mb-1'>Dispatchers</h2>
      <div className='flex gap-4'>
        <button className='px-2 py-1 border border-black rounded bg-green-300' onClick={() => dispatcher(increment(1))}>Increment</button>
        <button className='px-2 py-1 border border-black rounded bg-red-300' onClick={() => dispatcher(decrement(1))}>Decrement</button>
      </div>
    </div>
    <div className='m-2 shadow px-4 py-2 bg-amber-100 border border-black rounded-lg'>
      <div className='flex gap-4'>
        <div>
          <h2 className='font-bold text-xl mt-4 border-b border-black mb-1'>State</h2>
          <pre className='bg-black text-white p-2'>{JSON.stringify(state, undefined, 2)}</pre>
        </div>
        <div>
          <h2 className='font-bold text-xl mt-4 border-b border-black mb-1'>Optimistic State</h2>
          <pre className='bg-black text-white p-2'>{JSON.stringify(state, undefined, 2)}</pre>
        </div>
      </div>
    </div>
  </>;
}
