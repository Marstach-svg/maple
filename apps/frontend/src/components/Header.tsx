'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <header className="bg-gradient-to-r from-maple-500 via-primary-500 to-honey-500 shadow-lg border-b-2 border-honey-300/50 relative overflow-hidden">
      {/* Falling leaves animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute animate-bounce text-maple-200 opacity-30" style={{ left: '5%', animationDelay: '0s', animationDuration: '3s' }}>🍁</div>
        <div className="absolute animate-bounce text-honey-200 opacity-40" style={{ left: '15%', animationDelay: '1s', animationDuration: '4s' }}>🍂</div>
        <div className="absolute animate-bounce text-maple-300 opacity-35" style={{ left: '25%', animationDelay: '2s', animationDuration: '3.5s' }}>🍁</div>
        <div className="absolute animate-bounce text-primary-200 opacity-30" style={{ left: '35%', animationDelay: '0.5s', animationDuration: '4.5s' }}>🍂</div>
        <div className="absolute animate-bounce text-honey-300 opacity-40" style={{ left: '45%', animationDelay: '1.5s', animationDuration: '3s' }}>🍁</div>
        <div className="absolute animate-bounce text-maple-200 opacity-25" style={{ left: '55%', animationDelay: '2.5s', animationDuration: '4s' }}>🍂</div>
        <div className="absolute animate-bounce text-primary-300 opacity-35" style={{ left: '65%', animationDelay: '0.8s', animationDuration: '3.5s' }}>🍁</div>
        <div className="absolute animate-bounce text-honey-200 opacity-30" style={{ left: '75%', animationDelay: '1.8s', animationDuration: '4.5s' }}>🍂</div>
        <div className="absolute animate-bounce text-maple-300 opacity-40" style={{ left: '85%', animationDelay: '3s', animationDuration: '3s' }}>🍁</div>
        <div className="absolute animate-bounce text-primary-200 opacity-25" style={{ left: '95%', animationDelay: '2.2s', animationDuration: '4s' }}>🍂</div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-3xl animate-pulse">🍁</div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Maple
              </h1>
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <a 
              href="/app" 
              className="text-white hover:text-honey-100 font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-1"
            >
              <span>🗺️</span>
              <span>地図</span>
            </a>
            <a 
              href="/app/groups" 
              className="text-white hover:text-honey-100 font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-1"
            >
              <span>👥</span>
              <span>グループ</span>
            </a>
            
            <div className="flex items-center space-x-3 text-white">
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-full backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              >
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}