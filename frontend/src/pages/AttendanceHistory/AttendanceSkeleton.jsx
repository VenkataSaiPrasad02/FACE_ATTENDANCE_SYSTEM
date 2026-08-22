import React from 'react';
import Card from '../../components/ui/Card';

export default function AttendanceSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} glass className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="h-3 w-20 rounded bg-slate-200 animate-shimmer" />
                <div className="h-7 w-16 rounded bg-slate-200 animate-shimmer" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-200 animate-shimmer" />
            </div>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card glass className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Student', 'Roll Number', 'Batch', 'Semester', 'Date', 'Time', 'Status', 'Confidence', 'Attendance %'].map((col, idx) => (
                  <th key={idx} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">
                    <div className="h-3 w-16 rounded bg-slate-200/70 animate-shimmer" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 animate-shimmer" />
                      <div className="h-4 w-28 rounded bg-slate-200 animate-shimmer" />
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="h-6 w-20 rounded bg-slate-200/60 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-12 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-6 w-20 rounded-full bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-3 w-28 rounded-full bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-6 w-14 rounded-lg bg-slate-200 animate-shimmer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}