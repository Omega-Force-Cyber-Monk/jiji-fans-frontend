const ChannelCardSkeleton = () => {
  return (
    <div className="relative block aspect-[4/5] w-full overflow-hidden rounded-lg border border-border-primary/20 bg-secondary-bg">
      {/* Base background pulse */}
      <div className="absolute inset-0 z-0 bg-skeleton-bg animate-pulse" />
      
      {/* Premium Dark Gradient Mask overlaying bottom content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 opacity-90" />

      {/* Bottom overlay skeleton items */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-4 flex flex-col justify-end space-y-3">
        {/* Diamond accent skeleton */}
        <div className="w-1.5 h-1.5 rotate-45 rounded-sm bg-brand-primary/40 animate-pulse" />

        <div className="space-y-2">
          {/* Title skeleton */}
          <div className="h-6 w-3/4 bg-white/20 rounded-sm animate-pulse" />
          
          {/* Subtext skeleton */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-full bg-white/10 rounded-sm animate-pulse" />
            <div className="h-3.5 w-4/5 bg-white/10 rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelCardSkeleton;
