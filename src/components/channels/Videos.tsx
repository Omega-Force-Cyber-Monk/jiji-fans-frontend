"use client";

import React, { useEffect, useRef } from "react";
import { Empty, Spin } from "antd";
import { usePathname } from "next/navigation";
import { TContent, TPagination } from "@/redux/features/channel/channel.api";
import VideoCard from "./VideoCard";
import VideosSkeleton from "@/Common/Skeleton/Channels/VideosSkeleton";

interface VideosProps {
  contents?: TContent[];
  pagination?: TPagination;
  isLoading?: boolean;
  onLoadMore?: (direction: "next" | "previous") => void;
  channelId?: string;
  viewType?: "admin" | "creator" | "viewer" | "public";
}

const Videos = ({
  contents,
  pagination,
  isLoading,
  onLoadMore,
  channelId,
  viewType,
}: VideosProps) => {
  const pathname = usePathname();
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  console.log(contents, "Contents");
  const handleImageError = (videoId: string) => {
    setImageErrors((prev) => ({ ...prev, [videoId]: true }));
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!pagination?.hasNextPage) return;

    const option = { root: null, rootMargin: "20px", threshold: 0.1 };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        pagination?.hasNextPage &&
        !isLoading &&
        !isLoadingMore
      ) {
        setIsLoadingMore(true);
        onLoadMore?.("next");
        setTimeout(() => setIsLoadingMore(false), 1000);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    const timeoutId = setTimeout(() => {
      if (loadMoreRef.current) {
        observerRef.current?.observe(loadMoreRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observerRef.current?.disconnect();
    };
  }, [pagination?.hasNextPage, isLoading, isLoadingMore, onLoadMore]);

  const displayedContents = React.useMemo(() => {
    if (!contents) return [];
    const isSpecialView =
      viewType === "creator" ||
      viewType === "admin" ||
      pathname.includes("/mychannel") ||
      pathname.includes("/admin");

    if (isSpecialView) {
      return contents;
    }
    return contents.filter((v) => v.status?.toUpperCase() !== "SUSPENDED");
  }, [contents, viewType, pathname]);

  if (isLoading) {
    return <VideosSkeleton />;
  }

  if (displayedContents.length === 0) {
    return <Empty description="No videos available" />;
  }
  
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 2xl:grid-cols-4 gap-x-2 gap-y-5 sm:gap-x-5 2xl:gap-x-6 2xl:gap-y-7 items-stretch">
        {displayedContents.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            channelId={channelId}
            viewType={viewType}
            pathname={pathname}
            imageError={!!imageErrors[video._id]}
            onImageError={handleImageError}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {pagination?.hasNextPage && (
        <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
          {isLoadingMore && <Spin size="large" tip="Loading more videos..." />}
        </div>
      )}

      {/* End of list */}
      {!pagination?.hasNextPage &&
        !(contents.length > 0) &&
        viewType !== "admin" && (
          <div className="w-full py-8 flex justify-center">
            <p className="text-muted-text text-sm">No more videos to load</p>
          </div>
        )}
    </div>
  );
};

export default Videos;
