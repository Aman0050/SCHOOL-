import { useState, useRef, useEffect, useCallback } from 'react';
import type { Layout } from 'react-grid-layout';

const DEFAULT_LAYOUT: any[] = [
  { i: 'studentHero', x: 0, y: 0, w: 12, h: 2, static: true },
  { i: 'enrollmentAnalytics', x: 0, y: 2, w: 8, h: 4 },
  { i: 'studentRisk', x: 8, y: 2, w: 4, h: 4 },
  { i: 'demographics', x: 0, y: 6, w: 6, h: 4 },
  { i: 'liveActivity', x: 6, y: 6, w: 6, h: 4 }
];

export const useStudentLayoutStore = (userId: string) => {
  const storageKey = `student_layout_${userId}`;

  const [layout, setLayout] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse student layout from local storage', e);
    }
    return DEFAULT_LAYOUT;
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveLayout = useCallback((newLayout: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setLayout(newLayout);
      localStorage.setItem(storageKey, JSON.stringify(newLayout));
    }, 500);
  }, [storageKey]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(storageKey);
  };

  return { layout, saveLayout, resetLayout };
};
