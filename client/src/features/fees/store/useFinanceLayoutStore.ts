import { useState } from 'react';
import type { Layout } from 'react-grid-layout';

const DEFAULT_LAYOUT: any[] = [
  { i: 'financeHero', x: 0, y: 0, w: 12, h: 3, static: true },
  { i: 'healthScore', x: 0, y: 3, w: 4, h: 4 },
  { i: 'revenueIntel', x: 4, y: 3, w: 8, h: 4 },
  { i: 'collectionTrends', x: 0, y: 7, w: 8, h: 5 },
  { i: 'paymentMethods', x: 8, y: 7, w: 4, h: 5 }
];

const DEFAULT_VISIBLE = DEFAULT_LAYOUT.map(l => l.i);

export const useFinanceLayoutStore = (userId: string) => {
  const layoutKey = `finance_layout_v11_${userId}`;
  const visibleKey = `finance_visible_v11_${userId}`;

  const [layout, setLayout] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(layoutKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse finance layout from local storage', e);
    }
    return DEFAULT_LAYOUT;
  });

  const saveLayout = (newLayout: any[]) => {
    setLayout(newLayout);
    localStorage.setItem(layoutKey, JSON.stringify(newLayout));
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(layoutKey);
  };

  return { layout, saveLayout, resetLayout };
};
