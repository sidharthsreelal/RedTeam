'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('@/components/LandingPage'), { ssr: false });

export default function Home() {
  const router = useRouter();
  return <LandingPage onLaunch={() => router.push('/login')} />;
}
