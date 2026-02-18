'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import type { Group } from '@maple/shared';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
  });
  
  const [joinForm, setJoinForm] = useState({
    inviteCode: '',
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const groupsData = await api.groups.list();
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.groups.create(createForm.name, createForm.description);
      setCreateForm({ name: '', description: '' });
      setShowCreateForm(false);
      await loadGroups();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('グループの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.groups.join(joinForm.inviteCode);
      setJoinForm({ inviteCode: '' });
      setShowJoinForm(false);
      await loadGroups();
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('グループへの参加に失敗しました。招待コードを確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('招待コードをコピーしました');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-honey-500 mx-auto mb-4"></div>
            <p className="text-warm-700 font-semibold">🍯 読み込み中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-honey-200/50 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-maple-500 bg-clip-text text-transparent">
              👥 グループ管理
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowJoinForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-warm-300 to-warm-400 hover:from-warm-400 hover:to-warm-500 text-warm-800 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚪 グループに参加
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-honey-500 hover:from-primary-600 hover:to-honey-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ✨ 新しいグループ
              </button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-maple-500 bg-clip-text text-transparent">
              ✨ 新しいグループを作成
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-warm-800 mb-2">
                  👥 グループ名 *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium"
                  placeholder="例: 太郎と花子の旅行記録"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-warm-800 mb-2">
                  📝 説明
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 resize-none"
                  placeholder="グループの説明（任意）"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-honey-500 hover:from-primary-600 hover:to-honey-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none"
                >
                  {isSubmitting ? '💫 作成中...' : '🌟 作成'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gradient-to-r from-warm-300 to-warm-400 hover:from-warm-400 hover:to-warm-500 text-warm-800 py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ❌ キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {showJoinForm && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-maple-500 bg-clip-text text-transparent">
              🚪 グループに参加
            </h2>
            <form onSubmit={handleJoinSubmit} className="space-y-6">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-semibold text-warm-800 mb-2">
                  🔑 招待コード *
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  required
                  value={joinForm.inviteCode}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 bg-gradient-to-r from-honey-50 to-primary-50 border-2 border-honey-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 text-warm-800 font-medium font-mono tracking-wider"
                  placeholder="招待コードを入力"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-honey-500 hover:from-primary-600 hover:to-honey-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none"
                >
                  {isSubmitting ? '🔄 参加中...' : '🎉 参加'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="flex-1 bg-gradient-to-r from-warm-300 to-warm-400 hover:from-warm-400 hover:to-warm-500 text-warm-800 py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ❌ キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {groups.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-12 text-center">
              <div className="text-6xl mb-6">😔</div>
              <h3 className="text-xl font-bold text-warm-800 mb-3">
                グループがありません
              </h3>
              <p className="text-warm-600 mb-8">
                新しいグループを作成するか、既存のグループに参加してください。
              </p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-honey-200/50 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-warm-800 mb-3 flex items-center">
                      👥 {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-warm-600 mb-4 bg-gradient-to-r from-honey-50 to-primary-50 p-3 rounded-lg">{group.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-honey-50 px-3 py-2 rounded-lg">
                        <span className="text-warm-700 font-medium">👤 メンバー:</span>
                        <span className="font-bold text-primary-600">{group.members?.length || 0}/2</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-maple-50 to-honey-50 px-3 py-2 rounded-lg">
                        <span className="text-warm-700 font-medium">📍 ピン:</span>
                        <span className="font-bold text-maple-600">{group._count?.pins || 0}個</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-warm-50 to-honey-50 p-3 rounded-xl">
                      <span className="text-sm text-warm-700 font-medium">🔑 招待コード:</span>
                      <code className="px-3 py-1 bg-honey-200 text-honey-800 rounded-lg text-sm font-mono font-bold tracking-wider">
                        {group.inviteCode}
                      </code>
                      <button
                        onClick={() => copyInviteCode(group.inviteCode)}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-all duration-200 hover:bg-primary-100 px-2 py-1 rounded-lg"
                      >
                        📋 コピー
                      </button>
                    </div>
                    
                    {group.members && group.members.length < 2 && (
                      <span className="text-xs font-semibold text-honey-700 bg-gradient-to-r from-honey-100 to-honey-200 px-3 py-2 rounded-full animate-pulse">
                        ✨ メンバー募集中
                      </span>
                    )}
                  </div>
                </div>
                
                {group.members && group.members.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-honey-200">
                    <h4 className="text-lg font-semibold text-warm-800 mb-3 flex items-center">
                      👤 メンバー
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {group.members.map(member => (
                        <div key={member.id} className="flex items-center space-x-2 bg-gradient-to-r from-warm-100 to-honey-100 p-3 rounded-xl border border-warm-200/50">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-honey-400 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">
                              {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-warm-700">
                            {member.user.name || member.user.email}
                          </span>
                          {member.role === 'admin' && (
                            <span className="text-xs font-semibold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-200 px-2 py-1 rounded-full">
                              👑 管理者
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}