export default function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
        <div className="flex justify-between items-center">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton w-9 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}