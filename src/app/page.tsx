'use client';

import { useState } from 'react';
import { AppProvider, useApp } from '@/lib/store';
import AuthScreen from '@/components/AuthScreen';
import Workspace from '@/components/Workspace';
import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('@/components/LandingPage'), { ssr: false });

function AppContent() {
  const { state } = useApp();
  const [showLanding, setShowLanding] = useState(true);

  if (!state.authenticated) {
    if (showLanding) {
      return <LandingPage onLaunch={() => setShowLanding(false)} />;
    }
    return <AuthScreen />;
  }

  return <Workspace />;
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
