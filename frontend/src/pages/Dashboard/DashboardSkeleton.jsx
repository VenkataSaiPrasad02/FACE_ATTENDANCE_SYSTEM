import Skeleton from '../../components/ui/Skeleton';
import Card from '../../components/ui/Card';

export default function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="h-8 w-32 bg-gray-200 rounded mb-8 animate-shimmer" />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16
      }}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-3" />
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    </div>
  );
}
