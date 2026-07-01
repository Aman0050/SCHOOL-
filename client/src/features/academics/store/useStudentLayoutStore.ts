import { useState, useRef, useEffect, useCallback } from 'react';
import type { Layout } from 'react-grid-layout';

const DEFAULT_LAYOUT: any[] = [
  { i: 'studentHero', x: 0, y: 0, w: 12, h: 3, static: true },
  { i: 'enrollmentAnalytics', x: 0, y: 3, w: 8, h: 5 },
  { i: 'studentRisk', x: 8, y: 3, w: 4, h: 5 },
  { i: 'demographics', x: 0, y: 8, w: 6, h: 5 },
  { i: 'liveActivity', x: 6, y: 8, w: 6, h: 5 }
];

const DEFAULT_VISIBLE = DEFAULT_LAYOUT.map(l => l.i);

export const useStudentLayoutStore = (userId: string) => {
  const layoutKey = `student_layout_v11_${userId}`;
  const visibleKey = `student_visible_v11_${userId}`;

  const [layout, setLayout] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(layoutKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse student layout from local storage', e);
    }
    return DEFAULT_LAYOUT;
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

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(layoutKey);
  };

  return { layout, saveLayout, resetLayout };
};
