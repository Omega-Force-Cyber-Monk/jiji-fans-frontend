import ChannelCardSkeleton from "./_components/ChannelCardSkeleton";
import CategorySelectorSkeleton from "./_components/CategorySelectorSkeleton";

const OverviewGroupSkeleton = () => {
  return (
    <div className="w-full space-y-7 xl:space-y-10">
      <CategorySelectorSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, j) => (
          <ChannelCardSkeleton key={j} />
        ))}
      </div>
    </div>
  );
};

export default OverviewGroupSkeleton;
