"use client";

import { useGetChannelContentsQuery } from "@/redux/features/content/content.api";
import { cn } from "@/utils/cn";
import Image from "@/components/ui/CImage";
import { getYouTubeThumbnailUrl } from "@/lib/helpers/youtube";
import Link from "next/link";
import { Skeleton } from "antd";

/** Strip HTML tags so raw markup like <p>23</p> never renders as text */
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

/** YouTube-style skeleton suggestion card */
const SkeletonCard = () => (
  <div className="flex gap-x-2 p-1">
    {/* Thumbnail skeleton */}
    <div className="shrink-0 w-40 aspect-video rounded-xl overflow-hidden bg-secondary-bg">
      <Skeleton.Image active className="!w-full !h-full !rounded-xl" />
    </div>
    {/* Text skeleton */}
    <div className="flex-1 space-y-2 pt-1 min-w-0">
      <Skeleton.Input active size="small" className="!w-full !h-3.5" />
      <Skeleton.Input active size="small" className="!w-3/4 !h-3" />
      <Skeleton.Input active size="small" className="!w-1/2 !h-3" />
    </div>
  </div>
);

const VideoSuggetions = ({
  className,
  channelId,
  currentVideoId,
}: {
  className?: string;
  channelId: string;
  currentVideoId?: string;
}) => {
  const { data: contents, isLoading } = useGetChannelContentsQuery(channelId);

  const allVideos = contents?.data?.contents ?? [];

  // Filter out the currently playing video and any suspended videos
  const suggestions = allVideos.filter((v: any) => {
    const isCurrent = currentVideoId && v._id === currentVideoId;
    const isSuspended = v.status?.toUpperCase() === "SUSPENDED";
    return !isCurrent && !isSuspended;
  });

  return (
    <div
      className={cn(
        "md:sticky md:top-4 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-transparent",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-semibold text-primary-text tracking-tight">
          Up Next
        </h2>
        <span className="text-xs text-secondary-text uppercase tracking-wider font-medium">
          {suggestions.length} videos
        </span>
      </div>

      {/* List */}
      <div className="space-y-1">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : suggestions.length === 0 ? (
          <p className="text-secondary-text text-sm px-1 py-4 text-center">
            No other videos in this channel.
          </p>
        ) : (
          suggestions.map((content: any) => {
            const thumbnailUrl = getYouTubeThumbnailUrl(content.url);
            const cleanDescription = stripHtml(content.description ?? "");

            return (
              <Link
                key={content._id}
                href={`/overview/videos/${content._id}?channelId=${channelId}`}
                className="group flex gap-x-2 rounded-xl p-1 hover:bg-secondary-bg transition-colors duration-200"
              >
                {/* Thumbnail — 16:9 */}
                <div className="relative shrink-0 w-60 aspect-video rounded-xl overflow-hidden bg-secondary-bg border border-border-primary/30">
                  <Image
                    src={thumbnailUrl}
                    alt={content.title ?? "Video thumbnail"}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Duration badge — placeholder */}
                  <span className="absolute bottom-1 right-1.5 bg-black/80 text-white text-[10px] font-semibold px-1 py-0.5 rounded-sm leading-none">
                    01:55:40
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0 py-0.5 space-y-1">
                  {/* Title */}
                  <h5 className="text-sm font-semibold leading-snug line-clamp-2 text-primary-text group-hover:text-brand-primary transition-colors">
                    {content.title}
                  </h5>

                  {/* Description acting as channel/subtitle */}
                  {cleanDescription && (
                    <p className="text-xs text-secondary-text line-clamp-1 leading-tight">
                      {cleanDescription}
                    </p>
                  )}

                  {/* Meta row */}
                  <p className="text-[11px] text-muted-text">
                    {content.viewCount != null
                      ? `${Number(content.viewCount).toLocaleString()} views`
                      : ""}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VideoSuggetions;
