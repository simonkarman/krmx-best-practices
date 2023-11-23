/* eslint-disable max-len */
'use client';
import { KrmxLayer, useSystem } from '@/components/layer';
import { useKrmx } from '@krmx/client';
import { useState } from 'react';
import { decrement, increment } from 'system';

export default function MyApp() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <KrmxLayer>
          <MyComponent />
        </KrmxLayer>
      </div>
    </div>
  );
}

function MyComponent() {
  const { username, isConnected, isLinked, link, rejectionReason, send, leave, users } = useKrmx();
  const [ usernameInput, setUsernameInput ] = useState('');
  if (!isConnected) {
    // Your logic for when you're not connected to the server goes here
    return <p>No connection to the server...</p>;
  }
  if (!isLinked) {
    // Your logic for linking your connection with a user goes here
    return (<>
      <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
            Krmx Best Practices
      </a>
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Join the server
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={(e) => {
            link(usernameInput);
            e.preventDefault();
          }}>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your name</label>
              <input type="username" name="username" id="username"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="username" required=""
                value={usernameInput}
                onChange={(event) => {
                  setUsernameInput(event.target.value);
                }}
              />
            </div>
            <button type='submit'
              className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign
                  in
            </button>
            {rejectionReason && <p className="text-sm font-light text-red-500 dark:text-red-400">
                  Rejected: {rejectionReason}
            </p>}
          </form>
        </div>
      </div>
    </>
    );
  }
  // Your logic for when you're ready to go goes here
  return (<>
    <div className='flex gap-8 m-2 shadow px-4 py-2 bg-white border border-black rounded-lg'>
      <div>
        <h2 className='text-xl mt-2 mb-2'>
        Welcome <strong>{username}</strong>!
        </h2>
        <div className='flex gap-4'>
          <button className='px-2 py-1 border border-black rounded bg-blue-300' onClick={() => send({ type: 'custom/hello' })}>
          Send hello
          </button>
          <button className='px-2 py-1 border border-black rounded bg-red-300' onClick={leave}>
          Leave
          </button>
        </div>
      </div>
      <div>
        <h2 className='font-bold text-xl mt-2 border-b border-black mb-1'>All users</h2>
        <ul className='flex gap-4'>
          {Object.entries(users)
            .map(([otherUsername, { isLinked }]) => (
              <li key={otherUsername}>
                {isLinked ? '🟢' : '🔴'} {otherUsername}
              </li>),
            )}
        </ul>
      </div>
    </div>
    <SystemViewer />
  </>);
}

function SystemViewer() {
  const { state, optimisticState, dispatcher } = useSystem();
  return <>
    <div className='m-2 shadow px-4 py-2 bg-white border border-black rounded-lg'>
      <h2 className='font-bold text-xl mt-2 border-b border-black mb-1'>Dispatchers</h2>
      <div className='flex gap-4'>
        <button className='px-2 py-1 border border-black rounded bg-green-300' onClick={() => dispatcher(increment(1))}>Increment</button>
        <button className='px-2 py-1 border border-black rounded bg-red-300' onClick={() => dispatcher(decrement(1))}>Decrement</button>
      </div>
    </div>
    <div className='m-2 shadow px-4 py-2 bg-white border border-black rounded-lg'>
      <div className='flex gap-4'>
        <div>
          <h2 className='font-bold text-xl mt-4 border-b border-black mb-1'>State</h2>
          <p>Counter: {state.counter}</p>
          <pre className='bg-black text-white p-2'>{JSON.stringify(state, undefined, 2)}</pre>
        </div>
        <div>
          <h2 className='font-bold text-xl mt-4 border-b border-black mb-1'>Optimistic State</h2>
          <p>Counter: {state.counter}</p>
          <pre className='bg-black text-white p-2'>{JSON.stringify(optimisticState, undefined, 2)}</pre>
        </div>
      </div>
    </div>
  </>;
}
