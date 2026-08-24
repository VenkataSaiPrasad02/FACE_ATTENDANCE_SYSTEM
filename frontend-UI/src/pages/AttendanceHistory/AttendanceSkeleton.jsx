import React from 'react';
import Card from '../../components/ui/Card';

export default function AttendanceSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} glass className="space-y-3 p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="skeleton-block h-3 w-20 rounded" />
                <div className="skeleton-block h-7 w-16 rounded" />
              </div>
              <div className="skeleton-block h-10 w-10 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>

      {/* Mobile card-list skeleton */}
      <Card glass className="overflow-hidden p-0 lg:hidden">
        <div className="border-b border-white/[0.08] px-4 py-3.5">
          <div className="skeleton-block h-3 w-40 rounded" />
        </div>

        <div className="divide-y divide-white/[0.05]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="skeleton-block h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 space-y-1.5">
                    <div className="skeleton-block h-3.5 w-28 rounded" />
                    <div className="skeleton-block h-2.5 w-36 rounded opacity-70" />
                  </div>
                </div>
                <div className="skeleton-block h-6 w-20 shrink-0 rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1">
                    <div className="skeleton-block h-2.5 w-12 rounded opacity-70" />
                    <div className="skeleton-block h-3.5 w-16 rounded" />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="skeleton-block h-2.5 w-24 rounded opacity-70" />
                  <div className="skeleton-block h-2.5 w-8 rounded opacity-70" />
                </div>
                <div className="skeleton-block h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Table skeleton */}
      <Card glass className="hidden overflow-hidden p-0 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.04]">
                {['Student', 'Roll Number', 'Batch', 'Semester', 'Date', 'Time', 'Status', 'Confidence', 'Attendance %'].map((col, idx) => (
                  <th key={idx} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                    <div className="skeleton-block h-3 w-16 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="skeleton-block h-9 w-9 rounded-full" />
                      <div className="skeleton-block h-4 w-28 rounded" />
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="skeleton-block h-6 w-20 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-16 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-12 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-20 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-16 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-6 w-20 rounded-full" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-3 w-28 rounded-full" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-6 w-14 rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
