'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              Maple Travel Log
            </h1>
            <div className="flex space-x-4">
              <a
                href="/app"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                地図
              </a>
              <a
                href="/app/groups"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                グループ
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}