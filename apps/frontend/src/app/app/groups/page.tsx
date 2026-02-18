'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">グループ管理</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinForm(true)}
            className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50"
          >
            グループに参加
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            新しいグループ
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">新しいグループを作成</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                グループ名 *
              </label>
              <input
                id="name"
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="例: 太郎と花子の旅行記録"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                id="description"
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="グループの説明（任意）"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? '作成中...' : '作成'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {showJoinForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">グループに参加</h2>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                招待コード *
              </label>
              <input
                id="inviteCode"
                type="text"
                required
                value={joinForm.inviteCode}
                onChange={(e) => setJoinForm(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="招待コードを入力"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? '参加中...' : '参加'}
              </button>
              <button
                type="button"
                onClick={() => setShowJoinForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              グループがありません
            </h3>
            <p className="text-gray-600 mb-6">
              新しいグループを作成するか、既存のグループに参加してください。
            </p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="text-gray-600 mb-3">{group.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>メンバー: {group.members?.length || 0}/2</span>
                    <span>ピン: {group._count?.pins || 0}個</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">招待コード:</span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {group.inviteCode}
                    </code>
                    <button
                      onClick={() => copyInviteCode(group.inviteCode)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      コピー
                    </button>
                  </div>
                  
                  {group.members && group.members.length < 2 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      メンバー募集中
                    </span>
                  )}
                </div>
              </div>
              
              {group.members && group.members.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">メンバー</h4>
                  <div className="flex space-x-3">
                    {group.members.map(member => (
                      <div key={member.id} className="flex items-center space-x-1">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {member.user.name || member.user.email}
                        </span>
                        {member.role === 'admin' && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">
                            管理者
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
  );
}