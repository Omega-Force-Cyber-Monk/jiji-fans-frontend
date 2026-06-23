import { Skeleton } from "antd";

const MyChannelSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Hero Skeleton */}
      <div className="relative rounded-lg overflow-hidden bg-skeleton-bg h-64 sm:h-80 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-end gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-bg/50 border-4 border-skeleton-bg" />
          <div className="space-y-3 mb-2">
            <div className="h-8 w-48 sm:w-64 bg-primary-bg/40 rounded-md" />
            <div className="h-4 w-32 sm:w-48 bg-primary-bg/20 rounded-md" />
          </div>
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-skeleton-bg rounded-lg" />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-8 border-b border-border-primary pb-4">
        <div className="h-6 w-20 bg-skeleton-bg rounded-sm" />
        <div className="h-6 w-20 bg-skeleton-bg rounded-sm" />
        <div className="h-6 w-20 bg-skeleton-bg rounded-sm" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 bg-skeleton-bg rounded-lg" />
        ))}
      </div>
    </div>
  );
};

export default MyChannelSkeleton;
