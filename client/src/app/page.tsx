'use client';
import { Application } from '@/app/application';
import { LoginForm } from '@/app/login-form';
import { KrmxWithStateProvider } from '@/lib/krmx-with-state-provider';
import { useState } from 'react';

export default function Page() {
  // eslint-disable-next-line no-process-env
  const krmxUrl = process.env.NEXT_PUBLIC_KRMX_URL || 'localhost';
  const [serverUrl] = useState(`ws://${krmxUrl}:8082`);
  return (
    <KrmxWithStateProvider serverUrl={serverUrl}>
      <LoginForm>
        <Application />
      </LoginForm>
    </KrmxWithStateProvider>
  );
}
