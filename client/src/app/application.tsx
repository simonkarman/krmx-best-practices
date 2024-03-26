'use client';

import { useStatePhase } from '@/lib/krmx-with-state-provider';
// import {} from 'state';

export function Application() {
  const { phase } = useStatePhase<unknown>('lobby');
  return <>
    <div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700'>
      <div className="px-6 py-2 space-y-3 sm:space-y-4 sm:px-8 sm:py-4">
        <h2 className='font-bold text-xl'>Phase: lobby</h2>
        <pre>{JSON.stringify(phase, undefined, 2)}</pre>
      </div>
    </div>
  </>;
}
