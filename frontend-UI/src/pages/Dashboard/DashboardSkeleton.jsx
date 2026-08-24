import React from 'react';
import Card from '../../components/ui/Card';

export default function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-28 rounded-md skeleton-block" />
          <div className="h-8 w-48 rounded-lg skeleton-block" />
          <div className="h-4 w-72 rounded-md skeleton-block opacity-70" />
        </div>
        <div className="h-14 w-44 rounded-2xl skeleton-block" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-slide-up opacity-0"
            style={{ animationDelay: `${(i - 1) * 90}ms` }}
          >
            <Card glass className="relative overflow-hidden p-5 space-y-4">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl skeleton-block" />
                <div className="h-5 w-16 rounded-full skeleton-block opacity-70" />
              </div>
              <div className="space-y-2 py-2">
                <div className="h-8 w-24 rounded-lg skeleton-block" />
                <div className="h-3 w-32 rounded-md skeleton-block opacity-70" />
              </div>
              <div className="border-t border-white/[0.06] pt-3 flex justify-between">
                <div className="h-3 w-20 rounded-md skeleton-block opacity-60" />
                <div className="h-3 w-16 rounded-md skeleton-block opacity-60" />
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Summary and Quick Actions Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-slide-up opacity-0" style={{ animationDelay: '380ms' }}>
          <Card glass className="p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="h-6 w-36 rounded-md skeleton-block" />
              <div className="h-6 w-16 rounded-lg skeleton-block" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-16 rounded-xl border border-white/[0.06] bg-white/[0.03] skeleton-block" />
              ))}
            </div>
          </Card>
        </div>

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '460ms' }}>
          <Card glass className="p-6 space-y-5">
            <div className="h-6 w-32 rounded-md skeleton-block" />
            <div className="space-y-3">
              {[1, 2, 3].map((btn) => (
                <div key={btn} className="h-14 rounded-xl border border-white/[0.06] bg-white/[0.03] skeleton-block" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
