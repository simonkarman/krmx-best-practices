'use client';
import { KrmxWithSystemProvider, useSystem } from '@/provider/krmx-with-system-provider';
import { useKrmx } from '@krmx/client';
import { useState } from 'react';
import { decrement, increment } from 'system';

export default function Page() {
  // eslint-disable-next-line no-process-env
  const krmxUrl = process.env.NEXT_PUBLIC_KRMX_URL || 'localhost';
  const [serverUrl] = useState(`ws://${krmxUrl}:8082`);
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
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Join the server
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={(e) => {
            link(usernameInput.toLowerCase().trim());
            e.preventDefault();
          }}>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your name
              </label>
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
              <div className="pt-1 w-full text-right text-sm text-gray-300 dark:text-gray-600">you can only use a-z, A-Z and 0-9</div>
            </div>
            <button
              type="submit"
              className="w-full text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium
              rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800">
                Join
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
    <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700'>
      <div className="px-6 py-2 space-y-3 sm:space-y-4 sm:px-8 sm:py-4">
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-lg md:text-xl'>
          Hi, <strong>{username[0].toUpperCase() + username.slice(1)}</strong> 👋
          </h2>
          <button className='text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium
              rounded-lg text-sm px-5 py-1 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800' onClick={leave}>
          Leave
          </button>
        </div>
        <ul className='flex gap-4 text-sm md:text-base pb-0.5 w-full justify-left border-b border-gray-50 dark:border-gray-700 flex-wrap'>
          {Object.entries(users)
            .map(([otherUsername, { isLinked }]) => (
              <li
                key={otherUsername}
                className={`flex items-center gap-2 tracking-tight ${isLinked
                  ? 'text-gray-800 dark:text-gray-200'
                  : 'text-gray-400 dark:text-gray-400'}`}
              >
                <span>{isLinked ? '👤' : '🚫'}</span>
                <span>{otherUsername[0].toUpperCase() + otherUsername.slice(1)}</span>
              </li>),
            )}
        </ul>
      </div>
    </div>
    <Application />
  </>);
}

function Application() {
  const { state, optimisticState, dispatcher } = useSystem();
  return <>
    <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700'>
      <div className="px-6 py-2 space-y-3 sm:space-y-4 sm:px-8 sm:py-4">
        <h2 className='font-bold text-xl'>State</h2>
        <div className='w-full flex items-center justify-center gap-4'>
          <button
            className='text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium
              rounded-lg text-sm px-5 py-1 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800'
            onClick={() => dispatcher(decrement(1))}
          >
            Decrement
          </button>
          <p className='flex-grow text-center'>
            <span className='font-bold text-6xl'>{optimisticState.counter}</span>
            <span className='ml-2 text-gray-600 dark:text-gray-300'>{state.counter}</span>
          </p>
          <button
            className='text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium
              rounded-lg text-sm px-5 py-1 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
            onClick={() => dispatcher(increment(1))}
          >
            Increment
          </button>
        </div>
      </div>
    </div>
  </>;
}
