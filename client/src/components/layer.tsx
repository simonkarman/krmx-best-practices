import { KrmxProvider, useKrmx } from '@krmx/client';
import { createContext, MutableRefObject, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { system, System, Action, SystemState } from 'system';

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
  const systemRef = useRef(system);
  return (
    <KrmxProvider
      serverUrl={serverUrl}
      onMessage={(message) => {
        if (message?.type === 'sys') {
          const { dispatcher, type, payload } = message['payload'] as unknown as { dispatcher: string, type: string, payload: unknown };
          if (systemRef.current.dispatch(dispatcher, { type, payload }) !== true) {
            console.error('[ERROR] system dispatch failed', { dispatcher, type, payload });
          }
        }
      }}
    >
      <KrmxSystem systemRef={systemRef}>
        {props.children}
      </KrmxSystem>
    </KrmxProvider>
  );
}

export function KrmxSystem(props: PropsWithChildren<{
  systemRef: MutableRefObject<System<{counter: number}>>,
}>) {
  const { systemRef } = props;
  const { isLinked, username, send } = useKrmx();
  const [state, setState] = useState(system.initialState);
  const [optimisticState, setOptimisticState] = useState(system.initialState);
  useEffect(() => {
    systemRef.current.onChange((state) => setState(state));
    systemRef.current.onOptimisticChange((state) => setOptimisticState(state));
  }, []);
  useEffect(() => {
    if (isLinked) {
      systemRef.current.reset();
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
