'use client';

import { useRouter } from 'next/navigation';
import { AppProvider } from '@/lib/store';
import AuthScreen from '@/components/AuthScreen';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AppProvider>
      <AuthScreen onSuccess={() => router.push('/home')} />
    </AppProvider>
  );
}
