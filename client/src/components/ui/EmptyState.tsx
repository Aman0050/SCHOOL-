import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = Search, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ''
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 ${className}`}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150"></div>
        <div className="relative w-20 h-20 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 rounded-[1.5rem] flex items-center justify-center text-primary transform rotate-3 hover:rotate-6 transition-transform duration-300">
          <Icon className="w-10 h-10" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onAction} className="shadow-lg shadow-primary/25 rounded-xl px-6 py-2.5 font-bold">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
