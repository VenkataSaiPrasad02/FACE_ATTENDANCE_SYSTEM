import Skeleton from '../../components/ui/Skeleton';
import Card from '../../components/ui/Card';

export default function StudentsSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-shimmer" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-shimmer" />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <Skeleton className="w-72 h-10" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Full Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Face</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3"><Skeleton className="w-6 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-20 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-40 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-48 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-8 h-4" /></td>
                <td className="px-4 py-3"><Skeleton className="w-24 h-8" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}