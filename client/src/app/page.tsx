'use client';
import { KrmxLayer } from '@/components/krmx-layer';
import { useKrmx } from '@krmx/client';
import { produce } from 'immer';
import { useReducer } from 'react';

type State = { isValid: boolean };
export default function MyApp() {
  const [state, dispatch] = useReducer<State>((_state: State) => {
    return produce(_state, (state: State) => {
      state.isValid = false;
    });
  }, { isValid: true });
  return (
    <KrmxLayer messageConsumer={dispatch}>
      <MyComponent state={state} />
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
    </div>
  );
}
