'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import JapanMap from '@/components/JapanMap';
import PinForm from '@/components/PinForm';
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
    enabled: !!selectedGroup && !showPinForm,
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

  const handleMapClick = (coordinates: [number, number], prefecture: string) => {
    setFormInitialData({
      longitude: coordinates[0],
      latitude: coordinates[1],
      prefecture,
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
      
      setShowPinForm(false);
      setSelectedPin(null);
      setFormInitialData(null);
      
      invalidateCache();
      await forceRefresh();
    } catch (error) {
      console.error('Failed to save pin:', error);
      alert('ピンの保存に失敗しました');
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
        setShowPinForm(false);
        setSelectedPin(null);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          グループに参加して開始しましょう
        </h2>
        <p className="text-gray-600 mb-6">
          地図を使用するにはまずグループを作成するか、グループに参加する必要があります。
        </p>
        <a
          href="/app/groups"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          グループ管理へ
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">旅行ログ</h1>
          <div className="flex items-center space-x-2">
            {selectedGroup && (
              <p className="text-gray-600">{selectedGroup.name}</p>
            )}
            {lastUpdated && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>最終更新: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {groups.length > 1 && (
          <select
            value={selectedGroup?.id || ''}
            onChange={(e) => {
              const group = groups.find(g => g.id === e.target.value);
              setSelectedGroup(group || null);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <JapanMap
            pins={pins}
            prefectureStats={prefectureStats}
            onPinClick={handlePinClick}
            onMapClick={handleMapClick}
          />
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
            <div className="mt-4">
              <button
                onClick={handleDeletePin}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium"
              >
                ピンを削除
              </button>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">訪問統計</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>総ピン数:</span>
                <span className="font-semibold">{pins.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>訪問都道府県:</span>
                <span className="font-semibold">{prefectureStats.length}</span>
              </div>
            </div>
            
            {prefectureStats.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">都道府県別</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {prefectureStats
                    .sort((a, b) => b.count - a.count)
                    .map(stat => (
                      <div key={stat.prefecture} className="flex justify-between text-xs">
                        <span>{stat.prefecture}</span>
                        <span>{stat.count}件</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}