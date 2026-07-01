import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangle', ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'shimmer bg-muted',
          variant === 'circle' && 'rounded-full',
          variant === 'text' && 'rounded-md h-4 w-5/6',
          variant === 'rectangle' && 'rounded-2xl',
          className
        )
      )}
      {...props}
    />
  );
};

export default Skeleton;
