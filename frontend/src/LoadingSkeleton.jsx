import React from 'react';

export const EventCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-dark-400 bg-white dark:bg-dark-500 overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-slate-200 dark:bg-dark-400 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-dark-400 rounded w-24" />
          <div className="h-4 bg-slate-200 dark:bg-dark-400 rounded w-16" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-dark-400 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-dark-400 rounded w-1/2" />
        <div className="pt-3 border-t border-slate-100 dark:border-dark-400 flex justify-between items-center">
          <div className="h-5 bg-slate-200 dark:bg-dark-400 rounded w-20" />
          <div className="h-8 bg-slate-200 dark:bg-dark-400 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-100 dark:bg-dark-400/60 rounded-xl w-full" />
      ))}
    </div>
  );
};
