// hooks/useTracker.ts
'use client';

import { useEffect, useState } from 'react';
import AdvancedTracker from '../components/BurryPoint/advancedTracker';

declare global {
  interface Window {
    tracker?: AdvancedTracker;
  }
}

export function useTracker() {
  const [tracker, setTracker] = useState<AdvancedTracker | null>(null);

  useEffect(() => {
    if (!window.tracker) {
      console.error('Tracker not initialized. Make sure ClientTrackerProvider is used.');
      return;
    }
    setTracker(window.tracker);
  }, []);

  return tracker;
}