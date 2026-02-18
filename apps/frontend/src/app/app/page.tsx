'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import JapanMap from '@/components/JapanMap';
import PinForm from '@/components/PinForm';
import AppLayout from '@/components/AppLayout';
import type { Pin, Group } from '@maple/shared';

export default function AppPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    pins, 
    prefectureStats, 
    lastUpdated,
    forceRefresh,
    invalidateCache 
  } = useRealtimeData({
    groupId: selectedGroup?.id || null,
    enabled: !!selectedGroup,
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const groupsData = await api.groups.list();
      setGroups(groupsData);
      if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0]);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (coordinates: [number, number], prefecture: string, address?: string) => {
    setFormInitialData({
      longitude: coordinates[0],
      latitude: coordinates[1],
      prefecture,
      address: address || '',
    });
    setShowPinForm(true);
    setSelectedPin(null);
  };

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    setFormInitialData(pin);
    setShowPinForm(true);
  };

  const handlePinSubmit = async (pinData: any) => {
    if (!selectedGroup) return;
    
    setIsSubmitting(true);
    try {
      if (selectedPin) {
        await api.pins.update(selectedPin.id, pinData);
      } else {
        await api.pins.create(selectedGroup.id, pinData);
      }
      
      // First close the form to enable real-time updates
      setShowPinForm(false);
      setSelectedPin(null);
      setFormInitialData(null);
      
      // Then immediately update the data
      invalidateCache();
      await forceRefresh();
    } catch (error) {
      console.error('Failed to save pin:', error);
      alert('ピンの保存に失敗しました: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinCancel = () => {
    setShowPinForm(false);
    setSelectedPin(null);
    setFormInitialData(null);
  };

  const handleDeletePin = async () => {
    if (!selectedPin) return;
    
    if (confirm('このピンを削除しますか？')) {
      try {
        await api.pins.delete(selectedPin.id);
        
        // First close the form
        setShowPinForm(false);
        setSelectedPin(null);
        setFormInitialData(null);
        
        // Then immediately update the data
        invalidateCache();
        await forceRefresh();
      } catch (error) {
        console.error('Failed to delete pin:', error);
        alert('ピンの削除に失敗しました');
      }
    }
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

  if (groups.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 p-12 text-center max-w-md">
            <div className="text-6xl mb-6">🍁</div>
            <h2 className="text-2xl font-bold text-warm-800 mb-4">
              グループに参加して開始しましょう
            </h2>
            <p className="text-warm-600 mb-8">
              地図を使用するにはまずグループを作成するか、グループに参加する必要があります。
            </p>
            <a
              href="/app/groups"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-honey-500 hover:from-primary-600 hover:to-honey-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              🚀 グループ管理へ
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-honey-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedGroup && (
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">👥</div>
                  <p className="text-xl font-bold text-warm-800">{selectedGroup.name}</p>
                </div>
              )}
              {lastUpdated && (
                <div className="flex items-center space-x-2 text-sm text-warm-600 bg-honey-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-honey-400 rounded-full animate-pulse shadow-lg"></div>
                  <span>最終更新: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {groups.length > 1 && (
              <select
                value={selectedGroup?.id || ''}
                onChange={(e) => {
                  const group = groups.find(g => g.id === e.target.value);
                  setSelectedGroup(group || null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-honey-100 to-primary-100 border-2 border-honey-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 font-medium text-warm-800"
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-honey-200/50 overflow-hidden">
              <JapanMap
                pins={pins}
                prefectureStats={prefectureStats}
                onPinClick={handlePinClick}
                onMapClick={handleMapClick}
              />
            </div>
          </div>

          <div className="space-y-6">
            {showPinForm && (
              <PinForm
                initialData={formInitialData}
                onSubmit={handlePinSubmit}
                onCancel={handlePinCancel}
                isEdit={!!selectedPin}
                isLoading={isSubmitting}
              />
            )}

            {selectedPin && showPinForm && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-maple-200/50 p-4">
                <button
                  onClick={handleDeletePin}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🗑️ ピンを削除
                </button>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-honey-200/50 p-6">
              <h3 className="text-xl font-bold text-warm-800 mb-4 flex items-center">
                📊 訪問統計
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gradient-to-r from-honey-50 to-primary-50 p-3 rounded-xl">
                  <span className="text-warm-700 font-medium">総ピン数:</span>
                  <span className="font-bold text-lg text-primary-600">{pins.length}</span>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-maple-50 to-honey-50 p-3 rounded-xl">
                  <span className="text-warm-700 font-medium">訪問都道府県:</span>
                  <span className="font-bold text-lg text-maple-600">{prefectureStats.length}</span>
                </div>
              </div>
              
              {prefectureStats.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-warm-800 mb-3 flex items-center">
                    🍂 都道府県別
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {prefectureStats
                      .sort((a, b) => b.count - a.count)
                      .map((stat, index) => (
                        <div key={stat.prefecture} className="flex justify-between items-center bg-gradient-to-r from-warm-50 to-honey-50 p-3 rounded-lg border border-warm-200/30">
                          <span className="text-warm-700 font-medium">{stat.prefecture}</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${index < 3 ? 'bg-honey-400' : 'bg-warm-300'}`}></div>
                            <span className="font-bold text-warm-800">{stat.count}件</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}