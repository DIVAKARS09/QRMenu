export function MenuSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Header Cover Skeleton */}
      <div className="h-48 sm:h-64 bg-gray-200 rounded-3xl w-full" />

      {/* Shop Info Card Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-200 rounded-md w-2/3" />
            <div className="h-4 bg-gray-200 rounded-md w-1/3" />
          </div>
        </div>
      </div>

      {/* Categories Bar Skeleton */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Food Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded-md w-3/4" />
              <div className="h-3 bg-gray-200 rounded-md w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-gray-200 rounded-md w-16" />
                <div className="h-8 bg-gray-200 rounded-lg w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="h-8 bg-gray-200 rounded-md w-1/4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-1/2" />
            <div className="h-8 bg-gray-200 rounded-md w-1/3" />
          </div>
        ))}
      </div>
      <div className="h-96 bg-white border border-gray-200 rounded-3xl" />
    </div>
  );
}
