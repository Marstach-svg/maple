'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/app');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-honey-50 to-primary-100 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-12 text-center">
          <div className="text-6xl mb-6 animate-bounce">🍁</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-honey-500 mx-auto mb-4"></div>
          <p className="text-warm-700 font-semibold text-lg">Maple を読み込み中...</p>
        </div>
      </div>
    );
  }
  
  return null;
}