'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isRegisterMode) {
        await register(email, password, name || undefined);
      } else {
        await login(email, password);
      }
      router.push('/app');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('エラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🍁</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-maple-500 bg-clip-text text-transparent">
              Maple
            </h2>
            <p className="mt-2 text-warm-600 font-medium">
              {isRegisterMode ? '✨ アカウントを作成' : '🚪 アカウントにログイン'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-warm-800 mb-2">
                  📧 メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
                  placeholder="your@example.com"
                />
              </div>
              
              {isRegisterMode && (
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-warm-800 mb-2">
                    👤 名前（任意）
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
                    placeholder="お名前"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-warm-800 mb-2">
                  🔒 パスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
                  placeholder="パスワード"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium text-center">
                ❌ {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-honey-500 hover:from-primary-600 hover:to-honey-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none"
            >
              {isLoading ? '💫 処理中...' : isRegisterMode ? '🌟 登録' : '🚀 ログイン'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError('');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium transition-all duration-200 hover:bg-primary-100 px-4 py-2 rounded-lg"
              >
                {isRegisterMode ? '🔙 ログインに戻る' : '✨ 新規登録'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}