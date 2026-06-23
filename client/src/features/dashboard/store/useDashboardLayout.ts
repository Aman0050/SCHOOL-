import { useState } from 'react';
import type { Layout } from 'react-grid-layout';

const DEFAULT_LAYOUT: any[] = [
  { i: 'executiveHero', x: 0, y: 0, w: 12, h: 2, static: true },
  { i: 'healthScore', x: 0, y: 2, w: 4, h: 3 },
  { i: 'operations', x: 4, y: 2, w: 8, h: 3 },
  { i: 'criticalAction', x: 0, y: 5, w: 12, h: 2 },
  { i: 'attendanceAnalytics', x: 0, y: 7, w: 6, h: 4 },
  { i: 'feeAnalytics', x: 6, y: 7, w: 6, h: 4 },
  { i: 'academicAnalytics', x: 0, y: 11, w: 12, h: 4 },
  { i: 'studentIntel', x: 0, y: 15, w: 4, h: 4 },
  { i: 'teacherIntel', x: 4, y: 15, w: 4, h: 4 },
  { i: 'communication', x: 8, y: 15, w: 4, h: 4 },
  { i: 'quickActions', x: 0, y: 19, w: 4, h: 4 },
  { i: 'recentActivity', x: 4, y: 19, w: 4, h: 4 },
  { i: 'upcomingEvents', x: 8, y: 19, w: 4, h: 4 }
];

export const useDashboardLayout = (userId: string) => {
  const storageKey = `dashboard_layout_${userId}`;

  const [layout, setLayout] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse dashboard layout from local storage', e);
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
