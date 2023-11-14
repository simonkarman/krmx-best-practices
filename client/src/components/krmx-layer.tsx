import { KrmxProvider } from '@krmx/client';
import { PropsWithChildren, useState } from 'react';

export type MessageConsumer = <TMessage extends {type: string}>(message: TMessage) => void;

export function KrmxLayer(props: PropsWithChildren<{ messageConsumer: MessageConsumer }>) {
  const [serverUrl] = useState('ws://localhost:8082');
  return (
    <KrmxProvider
      serverUrl={serverUrl}
      onMessage={props.messageConsumer}
    >
      {props.children}
    </KrmxProvider>
  );
}
