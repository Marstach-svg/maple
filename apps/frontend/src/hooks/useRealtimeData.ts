'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePolling } from './usePolling';
import { api } from '@/lib/api';
import type { Pin, PrefectureStats } from '@maple/shared';

interface UseRealtimeDataProps {
  groupId: string | null;
  enabled?: boolean;
}

export function useRealtimeData({ groupId, enabled = true }: UseRealtimeDataProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [prefectureStats, setPrefectureStats] = useState<PrefectureStats[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const lastPinsHashRef = useRef<string>('');
  const lastStatsHashRef = useRef<string>('');
  
  const createHash = (data: any): string => {
    return JSON.stringify(data);
  };
  
  const loadData = useCallback(async () => {
    if (!groupId || !enabled) return;
    
    setIsLoading(true);
    try {
      const [pinsData, statsData] = await Promise.all([
        api.pins.list(groupId),
        api.groups.getStats(groupId),
      ]);
      
      const pinsHash = createHash(pinsData);
      const statsHash = createHash(statsData);
      
      if (pinsHash !== lastPinsHashRef.current) {
        setPins(pinsData);
        lastPinsHashRef.current = pinsHash;
      }
      
      if (statsHash !== lastStatsHashRef.current) {
        setPrefectureStats(statsData);
        lastStatsHashRef.current = statsHash;
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load realtime data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, enabled]);
  
  const { startPolling, stopPolling } = usePolling(loadData, {
    enabled: enabled && !!groupId,
    interval: 10000, // 10秒間隔でポーリング
  });
  
  // Initial data load when groupId or enabled changes
  useEffect(() => {
    if (enabled && groupId) {
      loadData();
    }
  }, [groupId, enabled, loadData]);
  
  const forceRefresh = useCallback(() => {
    return loadData();
  }, [loadData]);
  
  const invalidateCache = useCallback(() => {
    lastPinsHashRef.current = '';
    lastStatsHashRef.current = '';
  }, []);
  
  return {
    pins,
    prefectureStats,
    lastUpdated,
    isLoading,
    forceRefresh,
    invalidateCache,
    startPolling,
    stopPolling,
  };
}