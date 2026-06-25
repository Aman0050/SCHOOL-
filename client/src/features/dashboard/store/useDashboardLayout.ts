import { useState, useRef, useEffect, useCallback } from 'react';

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
  { i: 'reportsPanel', x: 0, y: 19, w: 4, h: 4 },
  { i: 'quickActions', x: 4, y: 19, w: 4, h: 4 },
  { i: 'recentActivity', x: 8, y: 19, w: 4, h: 4 },
  { i: 'upcomingEvents', x: 0, y: 23, w: 4, h: 4 }
];

const DEFAULT_VISIBLE = DEFAULT_LAYOUT.map(l => l.i);

export const useDashboardLayout = (userId: string) => {
  const layoutKey = `dashboard_layout_${userId}`;
  const visibleKey = `dashboard_visible_${userId}`;

  const [layout, setLayout] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(layoutKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse dashboard layout from local storage', e);
    }
    return DEFAULT_LAYOUT;
  });

  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(visibleKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_VISIBLE;
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveLayout = useCallback((newLayout: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setLayout(newLayout);
      localStorage.setItem(layoutKey, JSON.stringify(newLayout));
    }, 500);
  }, [layoutKey]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleWidget = (widgetId: string) => {
    setVisibleWidgets(prev => {
      let next;
      if (prev.includes(widgetId)) {
        next = prev.filter(id => id !== widgetId);
      } else {
        next = [...prev, widgetId];
      }
      localStorage.setItem(visibleKey, JSON.stringify(next));
      return next;
    });
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    setVisibleWidgets(DEFAULT_VISIBLE);
    localStorage.removeItem(layoutKey);
    localStorage.removeItem(visibleKey);
  };

  return { layout, saveLayout, resetLayout, visibleWidgets, toggleWidget };
};
