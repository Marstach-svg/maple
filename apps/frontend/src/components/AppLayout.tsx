'use client';

import ProtectedRoute from './ProtectedRoute';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-honey-50 via-primary-50 to-maple-100">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}