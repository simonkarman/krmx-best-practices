'use client';
import { Application } from '@/app/application';
import { LoginForm } from '@/app/login-form';
import { KrmxWithSystemProvider } from '@/provider/krmx-with-system-provider';
import { useState } from 'react';

export default function Page() {
  // eslint-disable-next-line no-process-env
  const krmxUrl = process.env.NEXT_PUBLIC_KRMX_URL || 'localhost';
  const [serverUrl] = useState(`ws://${krmxUrl}:8082`);
  return (
    <KrmxWithSystemProvider serverUrl={serverUrl}>
      <LoginForm>
        <Application />
      </LoginForm>
    </KrmxWithSystemProvider>
  );
}
