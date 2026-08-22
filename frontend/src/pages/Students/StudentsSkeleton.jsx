import React from 'react';
import Card from '../../components/ui/Card';

export default function StudentsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Search Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-slate-200 animate-shimmer" />
          <div className="h-4 w-64 rounded-md bg-slate-200/70 animate-shimmer" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-slate-200 animate-shimmer" />
      </div>

      <Card glass className="p-4 sm:p-5">
        <div className="h-10 w-full rounded-xl bg-slate-200/60 animate-shimmer" />
      </Card>

      {/* Table Skeleton */}
      <Card glass className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['#', 'Student', 'Roll Number', 'Course', 'Batch', 'Semester', 'Attendance %', 'Email', 'Face Status', 'Actions'].map((col, idx) => (
                  <th key={idx} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">
                    <div className="h-3 w-16 rounded bg-slate-200/70 animate-shimmer" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-4"><div className="h-4 w-6 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 animate-shimmer" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-28 rounded bg-slate-200 animate-shimmer" />
                        <div className="h-2.5 w-16 rounded bg-slate-200/60 animate-shimmer" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="h-6 w-24 rounded-lg bg-slate-200/60 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-10 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-6 w-14 rounded-lg bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-32 rounded bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-6 w-20 rounded-lg bg-slate-200 animate-shimmer" /></td>
                  <td className="px-5 py-4"><div className="h-8 w-16 rounded-lg bg-slate-200 animate-shimmer ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}