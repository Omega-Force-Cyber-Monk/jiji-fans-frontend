const ChannelProfileInfoSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 px-4 sm:px-10 lg:px-16">
      {/* Avatar */}
      <div className="-mt-8 h-32 sm:h-40 lg:h-48 w-32 sm:w-40 lg:w-48 shrink-0 rounded-full bg-skeleton-bg animate-pulse border-[6px] border-primary-bg z-20" />

      {/* Text block */}
      <div className="flex-1 space-y-3 pt-4 w-full">
        <div className="h-8 w-56 bg-skeleton-bg animate-pulse rounded-md" />
        <div className="h-4 w-40 bg-skeleton-bg animate-pulse rounded-md" />
        <div className="h-4 w-full max-w-md bg-skeleton-bg animate-pulse rounded-md" />
        <div className="h-4 w-2/3 bg-skeleton-bg animate-pulse rounded-md" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-32 bg-skeleton-bg animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-skeleton-bg animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ChannelProfileInfoSkeleton;
