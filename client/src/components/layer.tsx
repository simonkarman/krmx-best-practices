import { KrmxProvider, useKrmx } from '@krmx/client';
import { createHash } from 'crypto';
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
  const handlePayload = (messagePayload: unknown) => {
    const { dispatcher, type, payload, hash } = messagePayload as unknown as { dispatcher: string, type: string, payload: unknown, hash?: string };
    if (systemRef.current.dispatch(dispatcher, { type, payload }) !== true) {
      // TODO: disconnect on a verified dispatch that fails
      console.error('[ERROR] system dispatch failed', { dispatcher, type, payload });
    }
    if (hash) {
      // @ts-expect-error sourceState is private
      const state = systemRef.current.sourceState;
      const computedHash = createHash('sha256').update(JSON.stringify(state)).digest('hex');
      if (hash !== computedHash) {
        // TODO: disconnect on hash mismatch
        console.error('[ERROR] system corrupted due to mismatching hashes', hash, computedHash);
      }
    }
  };
  return (
    <KrmxProvider
      serverUrl={serverUrl}
      onMessage={(message) => {
        if (message?.type === 'sys-reset') {
          systemRef.current.reset();
        } else if (message?.type === 'sys') {
          handlePayload(message['payload']);
        } else if (message?.type === 'sys-batch') {
          console.info('batch', message);
          message['payload'].forEach(messagePayload => handlePayload(messagePayload));
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
  const { username, send } = useKrmx();
  const [state, setState] = useState(system.initialState);
  const [optimisticState, setOptimisticState] = useState(system.initialState);
  useEffect(() => {
    systemRef.current.onChange((state) => setState(state));
    systemRef.current.onOptimisticChange((state) => setOptimisticState(state));
  }, []);
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
