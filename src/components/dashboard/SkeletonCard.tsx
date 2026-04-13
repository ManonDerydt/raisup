import React from 'react';
import clsx from 'clsx';

interface Props {
  darkMode: boolean;
  lines?: number;
  className?: string;
}

const SkeletonCard: React.FC<Props> = ({ darkMode, lines = 3, className }) => (
  <div className={clsx(
    'rounded-xl border p-6 animate-pulse',
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    className,
  )}>
    <div className={clsx('h-4 rounded w-1/3 mb-4', darkMode ? 'bg-gray-700' : 'bg-gray-200')} />
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={clsx('h-3 rounded mb-2', darkMode ? 'bg-gray-700' : 'bg-gray-200')}
        style={{ width: `${70 + (i % 3) * 10}%` }}
      />
    ))}
  </div>
);

export default SkeletonCard;
