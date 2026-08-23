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

      {/* Table Skeleton */}
      <Card glass className="overflow-hidden p-0">
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
