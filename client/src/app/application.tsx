'use client';
import { useSystem, customSystem } from '@/provider/krmx-with-system-provider';

export function Application() {
  const { state, optimisticState, dispatcher } = useSystem();
  return <>
    <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700'>
      <div className="px-6 py-2 space-y-3 sm:space-y-4 sm:px-8 sm:py-4">
        <h2 className='font-bold text-xl'>State</h2>
        <div className='w-full flex items-center justify-center gap-4'>
          <button
            className='text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium
              rounded-lg text-sm px-5 py-1 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800'
            onClick={() => dispatcher(customSystem.decrement(1))}
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
            onClick={() => dispatcher(customSystem.increment(1))}
          >
            Increment
          </button>
        </div>
      </div>
    </div>
  </>;
}
