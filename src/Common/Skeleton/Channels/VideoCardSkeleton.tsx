const VideoCardSkeleton = () => {
  return (
    <div className="space-y-2">
      <div className="w-full aspect-[4/2.6] bg-skeleton-bg animate-pulse rounded-lg" />
      <div className="h-5 w-full bg-skeleton-bg animate-pulse rounded-md" />
      <div className="h-4 w-3/4 bg-skeleton-bg animate-pulse rounded-md" />
    </div>
  );
};

export default VideoCardSkeleton;
