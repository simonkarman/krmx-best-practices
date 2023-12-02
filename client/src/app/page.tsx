'use client';
import { KrmxWithSystemProvider, useSystem } from '@/provider/krmx-with-system-provider';
import { useKrmx } from '@krmx/client';
import { useState } from 'react';
import { decrement, increment } from 'system';

export default function Page() {
  const [serverUrl] = useState('ws://localhost:8082');
  return (
    <KrmxWithSystemProvider serverUrl={serverUrl}>
      <KrmxLoginForm />
    </KrmxWithSystemProvider>
  );
}

function KrmxLoginForm() {
  const { username, isConnected, isLinked, link, rejectionReason, leave, users } = useKrmx();
  const [ usernameInput, setUsernameInput ] = useState('');
  if (!isConnected) {
    return (<div className='flex gap-8 items-center'>
      <p className='text-6xl md:text-8xl'>
          😵
      </p>
      <p className='dark:text-white md:text-xl'>
        <span className='font-semibold'>Connection to the server was lost...</span><br/>
        <span className='text-gray-700 dark:text-gray-300'>Please, try again later.</span>
      </p>
    </div>);
  }
  if (!isLinked) {
    return (<>
      <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img className="w-8 h-8 mr-3" src="/apple-touch-icon.png" alt="logo" />
            Krmx Best Practices
      </div>
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Join the server
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={(e) => {
            link(usernameInput.toLowerCase());
            e.preventDefault();
          }}>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your name</label>
              <input
                type="username" name="username" id="username"
                placeholder="username" required
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block
                w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                dark:focus:border-blue-500"
                value={usernameInput}
                onChange={(event) => {
                  setUsernameInput(event.target.value);
                }}
              />
            </div>
            <button
              type='submit'
              className="w-full text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium
              rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800">
                Sign in
            </button>
          </form>
          {rejectionReason && <p className="text-sm tracking-tight text-gray-700 dark:text-gray-300">
            Rejected:{' '}
            <span className="tracking-normal text-base font-bold text-red-600 dark:text-red-400">
              {rejectionReason[0].toUpperCase() + rejectionReason.slice(1)}.
            </span>
          </p>}
        </div>
      </div>
    </>
    );
  }
  return (<>
    <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
      <div className="px-6 py-2 space-y-4 sm:space-y-6 sm:px-8 sm:py-4">
        <ul className='flex gap-1 text-sm md:text-base pb-0.5 w-full justify-between border-b border-gray-100 dark:border-gray-700'>
          {Object.entries(users)
            .map(([otherUsername, { isLinked }]) => (
              <li key={otherUsername} className='flex items-center gap-2 tracking-tight'>
                <span>{isLinked ? '👤' : '🚫'}</span>
                <span>{otherUsername}</span>
              </li>),
            )}
        </ul>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-lg md:text-xl'>
          Hi, <strong>{username[0].toUpperCase() + username.slice(1)}</strong> 👋
          </h2>
          <button className='text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium
              rounded-lg text-sm px-5 py-1 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800' onClick={leave}>
          Leave
          </button>
        </div>
      </div>
    </div>
    {/*<DispatchersAndState />*/}
  </>);
}

function DispatchersAndState() {
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
