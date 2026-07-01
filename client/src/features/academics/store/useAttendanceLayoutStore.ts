import { useState } from 'react';
import type { Layout } from 'react-grid-layout';

const DEFAULT_LAYOUT: any[] = [
  { i: 'attendanceHero', x: 0, y: 0, w: 12, h: 3, static: true },
  { i: 'healthScore', x: 0, y: 3, w: 4, h: 3 },
  { i: 'realTimeMonitoring', x: 4, y: 3, w: 8, h: 3 },
  { i: 'studentAnalytics', x: 0, y: 6, w: 8, h: 5 },
  { i: 'smartAlerts', x: 8, y: 6, w: 4, h: 5 },
  { i: 'liveFeed', x: 0, y: 11, w: 12, h: 5 }
];

export const useAttendanceLayoutStore = (userId: string) => {
  const storageKey = `attendance_layout_v2_${userId}`;

  const [layout, setLayout] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse attendance layout from local storage', e);
    }
    return DEFAULT_LAYOUT;
  });

  const saveLayout = (newLayout: any[]) => {
    setLayout(newLayout);
    localStorage.setItem(storageKey, JSON.stringify(newLayout));
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(storageKey);
  };

  return { layout, saveLayout, resetLayout };
};
