export default function Skeleton({ className, lines = 1 }) {
  return (
    <div className={`animate-shimmer ${className}`}>
      {lines === 1 ? (
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      ) : (
        Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded mb-2 last:mb-0"
            style={{ width: `${75 - (i * 10)}%` }}
          />
        ))
      )}
    </div>
  );
}

