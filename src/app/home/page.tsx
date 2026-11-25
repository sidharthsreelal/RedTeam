'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '@/lib/store';
import Workspace from '@/components/Workspace';

function HomeGuard() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.authenticated) {
      router.replace('/login');
    }
  }, [state.authenticated, router]);

  if (!state.authenticated) return null;

  return <Workspace />;
}

export default function HomePage() {
  return (
    <AppProvider>
      <HomeGuard />
    </AppProvider>
  );
}
