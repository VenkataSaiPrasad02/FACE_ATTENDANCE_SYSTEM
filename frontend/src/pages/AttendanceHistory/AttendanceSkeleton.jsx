import Skeleton from '../../components/ui/Skeleton';
import Card from '../../components/ui/Card';

export default function AttendanceSkeleton() {
  return (
    <div>
      <div className="h-8 w-40 bg-gray-200 rounded mb-6 animate-shimmer" />

      <Card className="mb-6 p-4">
        <div className="flex gap-4 flex-wrap">
          <Skeleton className="w-48 h-10" />
          <Skeleton className="w-36 h-10" />
          <Skeleton className="w-36 h-10" />
          <Skeleton className="w-36 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3"><Skeleton className="w-32 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-20 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-24 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-16 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-20 h-6" /></td>
                <td className="px-4 py-3"><Skeleton className="w-14 h-4" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}