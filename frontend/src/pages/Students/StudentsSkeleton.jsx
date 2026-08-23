import React from 'react';
import Card from '../../components/ui/Card';

export default function StudentsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Search Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="skeleton-block h-8 w-44 rounded-lg" />
          <div className="skeleton-block h-4 w-64 rounded-md opacity-70" />
        </div>
        <div className="skeleton-block h-11 w-36 rounded-xl" />
      </div>

      <Card glass className="p-4 sm:p-5">
        <div className="skeleton-block h-10 w-full rounded-xl opacity-80" />
      </Card>

      {/* Table Skeleton */}
      <Card glass className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.04]">
                {['#', 'Student', 'Roll Number', 'Course', 'Batch', 'Semester', 'Attendance %', 'Email', 'Face Status', 'Actions'].map((col, idx) => (
                  <th key={idx} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                    <div className="skeleton-block h-3 w-16 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-6 rounded" /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="skeleton-block h-9 w-9 rounded-full" />
                      <div className="space-y-1">
                        <div className="skeleton-block h-3.5 w-28 rounded" />
                        <div className="skeleton-block h-2.5 w-16 rounded opacity-70" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="skeleton-block h-6 w-24 rounded-lg opacity-80" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-16 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-20 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-10 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-6 w-14 rounded-lg" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-4 w-32 rounded" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block h-6 w-20 rounded-lg" /></td>
                  <td className="px-5 py-4"><div className="skeleton-block ml-auto h-8 w-16 rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
