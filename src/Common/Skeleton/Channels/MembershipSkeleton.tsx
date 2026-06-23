const MembershipSkeleton = () => {
  return (
    <div className="w-full mx-auto space-y-8">
      {/* Current Membership Card Skeleton */}
      <div className="space-y-4">

        <div className="bg-brand-primary/5 rounded-lg px-8 py-6 space-y-4 border border-brand-primary/10">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-skeleton-bg animate-pulse rounded-md" />
              <div className="h-4 w-64 bg-skeleton-bg animate-pulse rounded-md" />
            </div>
          </div>
          <div className="pt-2">
            <div className="h-9 w-40 bg-skeleton-bg animate-pulse rounded-md" />
          </div>
        </div>
      </div>

      {/* Available Plans Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-skeleton-bg animate-pulse rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="bg-secondary-bg/80 backdrop-blur-md shadow-sm rounded-2xl p-6 md:p-8 w-full border border-border-primary flex flex-col transition-all duration-300"
            >
              <div className="mb-6 space-y-2">
                {/* Title */}
                <div className="h-6 w-32 bg-skeleton-bg animate-pulse rounded-md" />
                {/* Price */}
                <div className="flex items-baseline gap-1 mt-2">
                  <div className="h-10 w-24 bg-skeleton-bg animate-pulse rounded-md" />
                  <div className="h-4 w-12 bg-skeleton-bg animate-pulse rounded-md" />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-border-primary/50 mb-6" />

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-grow">
                {Array.from({ length: 4 }).map((_, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-skeleton-bg rounded-full shrink-0 animate-pulse mt-0.5" />
                    <div className="h-4 w-full bg-skeleton-bg animate-pulse rounded-md" />
                  </li>
                ))}
              </ul>

              {/* Button */}
              <div className="mt-auto space-y-3">
                <div className="h-12 w-full bg-skeleton-bg animate-pulse rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipSkeleton;
