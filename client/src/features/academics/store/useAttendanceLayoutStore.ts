import { useState } from 'react';
import type { Layout } from 'react-grid-layout';

const DEFAULT_LAYOUT: Layout[] = [
  { i: 'attendanceHero', x: 0, y: 0, w: 12, h: 2, static: true },
  { i: 'healthScore', x: 0, y: 2, w: 4, h: 3 },
  { i: 'realTimeMonitoring', x: 4, y: 2, w: 8, h: 3 },
  { i: 'studentAnalytics', x: 0, y: 5, w: 8, h: 4 },
  { i: 'smartAlerts', x: 8, y: 5, w: 4, h: 4 },
  { i: 'liveFeed', x: 0, y: 9, w: 6, h: 5 },
  { i: 'hardwareSync', x: 6, y: 9, w: 6, h: 5 }
];

export const useAttendanceLayoutStore = (userId: string) => {
  const storageKey = `attendance_layout_${userId}`;

  const [layout, setLayout] = useState<Layout[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse attendance layout from local storage', e);
    }
    return DEFAULT_LAYOUT;
  });

  const saveLayout = (newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem(storageKey, JSON.stringify(newLayout));
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(storageKey);
  };

  return { layout, saveLayout, resetLayout };
};
