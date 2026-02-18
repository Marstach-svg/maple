'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  enabled: boolean;
  interval: number;
}

export function usePolling(
  callback: () => Promise<void> | void,
  { enabled = true, interval = 30000 }: UsePollingOptions
) {
  const intervalRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;
  
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }, [interval]);
  
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);
  
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return stopPolling;
  }, [enabled, startPolling, stopPolling]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled) {
        startPolling();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);
  
  return { startPolling, stopPolling };
}