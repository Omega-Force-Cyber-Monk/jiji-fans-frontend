"use client";
import React, { useEffect, useRef, useState } from "react";
import { useGetChannelsByCategoryQuery, TCategory, TChannel } from "@/redux/features/channel/channel.api";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { useSearchParams } from "next/navigation";
import ChannelCard from "./_components/ChannelCard";
import OverviewGroupSkeleton from "@/Common/Skeleton/app/(dashboard)/overview/(group)/OverviewGroupSkeleton";
import ChannelCardSkeleton from "@/Common/Skeleton/app/(dashboard)/overview/(group)/_components/ChannelCardSkeleton";
import CategorySelector from "./_components/CategorySelector";
import RecentlyVisitedSlider from "./_components/RecentlyVisitedSlider";
import FeaturedSlider from "./_components/FeaturedSlider";

const Page = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [allCategories, setAllCategories] = useState<TCategory[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [hasMore, setHasMore] = useState(true);
  const loadedCursorsRef = useRef<Set<string>>(new Set());

  const searchPams = useSearchParams();
  const channelName = searchPams.get("search");

  // Fetch categories once to enable seamless client-side smooth sliding navigation
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllCategoriesQuery({ limit: 100 });

  const isInitialLoad = cursor === undefined;
  const currentLimit = isInitialLoad ? 28 : 12;

  // For "all", we fetch grouped categories and flatten them.
  // For a specific category, we fetch that category.
  const queryArgs = selectedCategory === "all"
    ? { limit: 5, channelLimit: currentLimit, cursor, query: channelName ?? undefined }
    : { category: selectedCategory, channelLimit: currentLimit, channelCursor: cursor, query: channelName ?? undefined };

  const { data, isLoading, isFetching } = useGetChannelsByCategoryQuery(queryArgs, {
    skip: !hasMore && cursor !== undefined,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    setAllCategories([]);
    setCursor(undefined);
    setHasMore(true);
    setVisibleCount(12);
    loadedCursorsRef.current.clear();
  }, [channelName, selectedCategory]);

  useEffect(() => {
    if (data?.data) {
      const { categories, pagination } = data.data;
      const currentCursor = cursor || "initial";
      if (!loadedCursorsRef.current.has(currentCursor)) {
        loadedCursorsRef.current.add(currentCursor);

        if (cursor === undefined) {
          // Initial load
          setAllCategories(categories);
        } else {
          // Append new items
          if (selectedCategory === "all") {
            // For "all", append categories avoiding duplicates by checking _id
            setAllCategories((prev) => {
              const existingIds = new Set(prev.map((cat) => cat._id));
              const newCategories = categories.filter((cat) => !existingIds.has(cat._id));
              return [...prev, ...newCategories];
            });
          } else {
            // For a specific category, append channels to the existing category
            setAllCategories((prev) => {
              if (prev.length === 0) return categories;
              const prevCategory = prev[0];
              const newCategory = categories[0];
              if (!newCategory) return prev;

              const existingChannelIds = new Set(prevCategory.channels.map((ch) => ch._id));
              const newChannels = newCategory.channels.filter((ch) => !existingChannelIds.has(ch._id));

              return [{
                ...prevCategory,
                channels: [...prevCategory.channels, ...newChannels],
                channelPagination: newCategory.channelPagination
              }];
            });
          }
        }
      }

      // If we are looking at "all" we use the main pagination, else we use the channelPagination
      if (selectedCategory === "all") {
        setHasMore(pagination.hasNextPage);
      } else {
        const categoryData = categories[0];
        setHasMore(categoryData?.channelPagination?.hasNextPage ?? false);
      }
    }
  }, [data, cursor, selectedCategory]);



  if ((isLoading && allCategories.length === 0) || isLoadingCategories) {
    return <OverviewGroupSkeleton />;
  }

  // Flatten channels to display in grids
  const displayChannels = allCategories.flatMap(cat => cat.channels);
  const firstTwenty = displayChannels.slice(0, 20);
  const remaining = displayChannels.slice(20);
  const visibleRemaining = remaining.slice(0, visibleCount);

  const fetchedCategories = categoriesData?.data?.categories || [];
  const featuredChannels = displayChannels.slice(0, 8);

  const handleShowMore = () => {
    // Determine the next visible count
    const nextVisibleCount = visibleCount + 12;
    setVisibleCount(nextVisibleCount);

    // If we've run out of channels in memory and the API has more, fetch them
    if (remaining.length <= visibleCount && hasMore && !isFetching && data?.data) {
      let nextCursor: string | undefined = undefined;

      if (selectedCategory === "all") {
        nextCursor = data.data.pagination?.nextCursor;
      } else {
        const categoryData = data.data.categories[0];
        nextCursor = categoryData?.channelPagination?.nextCursor;
      }

      if (nextCursor && nextCursor !== cursor) {
        setCursor(nextCursor);
      }
    }
  };

  const showButton = remaining.length > visibleCount || hasMore;

  return (
    <div className="w-full space-y-8 xl:space-y-12">
      <CategorySelector
        categories={fetchedCategories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(id) => setSelectedCategory(id)}
      />

      {firstTwenty.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {firstTwenty.map((channel) => (
            <ChannelCard key={channel._id} channel={channel} />
          ))}
        </div>
      ) : (
        !isFetching && (
          <div className="flex h-40 items-center justify-center text-primary-text">
            No channels found.
          </div>
        )
      )}

      {/* Recently visited — powered by API, renders null when empty */}
      <RecentlyVisitedSlider />

      <FeaturedSlider channels={featuredChannels} />

      {visibleRemaining.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleRemaining.map((channel) => (
            <ChannelCard key={channel._id} channel={channel} />
          ))}
        </div>
      )}

      {/* Loading Skeletons */}
      {isFetching && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ChannelCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Show More Trigger */}
      {showButton && !isFetching && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleShowMore}
            className="flex items-center justify-center gap-6 border border-border-primary bg-secondary-bg text-primary-text hover:border-brand-primary hover:text-brand-primary outline-hidden rounded-md h-12 px-8 text-sm font-medium transition-all cursor-pointer"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
