import { KrmxProvider, useKrmx } from '@krmx/client';
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { system, Action, SystemState } from 'system';

export type MessageConsumer = <TMessage extends {type: string}>(message: TMessage) => void;

const SystemContext = createContext<{
  state: SystemState,
  optimisticState: SystemState,
  dispatcher: (action: Action) => boolean
    }>({
      state: system.initialState,
      optimisticState: system.initialState,
      dispatcher: () => false,
    });
export const useSystem = () => {
  return useContext(SystemContext);
};

export function KrmxLayer(props: PropsWithChildren) {
  const [serverUrl] = useState('ws://localhost:8082');
  const [subscription, setSubscription] = useState<MessageConsumer>();
  return (
    <KrmxProvider
      serverUrl={serverUrl}
      onMessage={(message) => {
        console.info(message);
        if (subscription) {
          subscription(message);
        }
      }}
    >
      <KrmxSystem setSubscription={setSubscription}>
        {props.children}
        {subscription === undefined ? 'System is not subscribed!' : 'Ready!'}
      </KrmxSystem>
    </KrmxProvider>
  );
}

export function KrmxSystem(props: PropsWithChildren<{ setSubscription: (subscription?: MessageConsumer) => void }>) {
  const { isLinked, username, unlink, send } = useKrmx();
  const systemRef = useRef(system);
  const [state, setState] = useState(system.initialState);
  const [optimisticState, setOptimisticState] = useState(system.initialState);
  useEffect(() => {
    systemRef.current.onChange((state) => setState(state));
    systemRef.current.onOptimisticChange((state) => setOptimisticState(state));
  }, []);
  useEffect(() => {
    if (isLinked) {
      systemRef.current.reset();

      // TODO: why does this not work?
      console.info('Subscribing now!');
      props.setSubscription((message) => {
        if (message?.type === 'sys') {
          const { dispatcher, type, payload } = message['payload'] as unknown as { dispatcher: string, type: string, payload: unknown };
          if (systemRef.current.dispatch(dispatcher, { type, payload }) !== true) {
            console.error('[ERROR] system dispatch failed', { dispatcher, type, payload });
            unlink();
          }
        }
      });
    }
  }, [isLinked]);
  const dispatcher = (action: Action): boolean => {
    if (systemRef.current.dispatch(username, action, true) === true) {
      send(action);
      return true;
    }
    return false;
  };
  return <SystemContext.Provider value={{
    state,
    optimisticState,
    dispatcher,
  }}>
    {props.children}
  </SystemContext.Provider>;
}
