const ChannelAboutSkeleton = () => {
  return (
    <div className="max-w-[95%] sm:max-w-[90%] mx-auto space-y-4 md:space-y-6">
      {/* About text block */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 sm:p-8 lg:p-12 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`h-4 bg-skeleton-bg animate-pulse rounded-md ${i === 5 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex justify-evenly gap-3 bg-secondary-bg border border-border-primary rounded-lg p-8 lg:p-12">
        <div className="text-center space-y-2">
          <div className="h-4 w-24 bg-skeleton-bg animate-pulse rounded-md mx-auto" />
          <div className="h-7 w-16 bg-skeleton-bg animate-pulse rounded-md mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <div className="h-4 w-24 bg-skeleton-bg animate-pulse rounded-md mx-auto" />
          <div className="h-7 w-16 bg-skeleton-bg animate-pulse rounded-md mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default ChannelAboutSkeleton;
