import { useState, useRef, useEffect, useCallback } from 'react';

export const DEFAULT_LAYOUT: any[] = [
  { i: 'executiveHero', x: 0, y: 0, w: 12, h: 3, static: true },
  { i: 'healthScore', x: 0, y: 3, w: 4, h: 4 },
  { i: 'operations', x: 4, y: 3, w: 8, h: 4 },
  { i: 'attendanceAnalytics', x: 0, y: 7, w: 6, h: 5 },
  { i: 'feeAnalytics', x: 6, y: 7, w: 6, h: 5 },
  { i: 'quickActions', x: 0, y: 12, w: 4, h: 5 },
  { i: 'recentActivity', x: 4, y: 12, w: 4, h: 5 },
  { i: 'upcomingEvents', x: 8, y: 12, w: 4, h: 5 }
];

const DEFAULT_VISIBLE = DEFAULT_LAYOUT.map(l => l.i);

export const useDashboardLayout = (userId: string) => {
  const layoutKey = `dashboard_layout_v11_${userId}`;
  const visibleKey = `dashboard_visible_v11_${userId}`;

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

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
