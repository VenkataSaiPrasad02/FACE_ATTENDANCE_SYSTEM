import React from 'react';
import Card from '../../components/ui/Card';

export default function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded-md bg-slate-200 animate-shimmer" />
          <div className="h-8 w-48 rounded-lg bg-slate-200 animate-shimmer" />
          <div className="h-4 w-72 rounded-md bg-slate-200/70 animate-shimmer" />
        </div>
        <div className="h-14 w-44 rounded-2xl bg-slate-200/80 animate-shimmer" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} glass className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-slate-200 animate-shimmer" />
              <div className="h-5 w-16 rounded-full bg-slate-200/70 animate-shimmer" />
            </div>
            <div className="space-y-2 py-2">
              <div className="h-8 w-24 rounded-lg bg-slate-200 animate-shimmer" />
              <div className="h-3 w-32 rounded-md bg-slate-200/60 animate-shimmer" />
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between">
              <div className="h-3 w-20 rounded-md bg-slate-200/50 animate-shimmer" />
              <div className="h-3 w-16 rounded-md bg-slate-200/50 animate-shimmer" />
            </div>
          </Card>
        ))}
      </div>

      {/* Summary and Quick Actions Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card glass className="p-6 space-y-5">
          <div className="flex justify-between items-center">
            <div className="h-6 w-36 rounded-md bg-slate-200 animate-shimmer" />
            <div className="h-6 w-16 rounded-lg bg-slate-200 animate-shimmer" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-16 rounded-xl bg-slate-200/60 animate-shimmer" />
            ))}
          </div>
        </Card>

        <Card glass className="p-6 space-y-5">
          <div className="h-6 w-32 rounded-md bg-slate-200 animate-shimmer" />
          <div className="space-y-3">
            {[1, 2, 3].map((btn) => (
              <div key={btn} className="h-14 rounded-xl bg-slate-200/60 animate-shimmer" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
