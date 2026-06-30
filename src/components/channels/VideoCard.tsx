"use client";

import Image from "@/components/ui/CImage";
import { PlayCircleIcon } from "@heroicons/react/16/solid";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { getYouTubeThumbnailUrl } from "@/lib/helpers/youtube";
import Link from "next/link";
import { Tooltip } from "antd";
import { TContent } from "@/redux/features/channel/channel.api";

interface VideoCardProps {
  video: TContent;
  channelId?: string;
  viewType?: "admin" | "creator" | "viewer" | "public";
  pathname: string;
  imageError: boolean;
  onImageError: (id: string) => void;
}

const FALLBACK_IMAGE = "/static/demo-image.jpg";

const VideoCardContent = ({
  video,
  imageError,
  onImageError,
}: Pick<VideoCardProps, "video" | "imageError" | "onImageError">) => {
  const isLocked = video.hasAccess === false;

  return (
    <>
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-lg aspect-[4/2.6] bg-secondary-bg">
        <Image
          src={imageError ? FALLBACK_IMAGE : getYouTubeThumbnailUrl(video.url)}
          alt={video.title}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isLocked ? "grayscale-[0.35] brightness-75" : ""
            }`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => onImageError(video._id)}
        />
        {isLocked ? (
          <>
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-primary-bg/90 text-primary-text text-sm font-semibold shadow">
                <LockClosedIcon className="w-4" />
                Locked
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-warning/70 rounded-lg pointer-events-none" />
          </>
        ) : (
          <div className="group-hover:flex hidden absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/60 justify-center items-center">
            <PlayCircleIcon className="w-8 text-white" />
          </div>
        )}
      </div>

      {/* Text body — flex-col so footer is always at the bottom */}
      <div className="flex flex-col flex-1 gap-y-1 min-h-0">
        <h5 className="text-lg font-medium line-clamp-1 text-primary-text capitalize">
          {video.title}
        </h5>
        <div
          className="text-sm text-secondary-text line-clamp-2 rich-description flex-1"
          dangerouslySetInnerHTML={{ __html: video.description || "" }}
        />
        {isLocked && (
          <p className="text-sm font-medium text-warning">
            Subscribe to unlock this video
          </p>
        )}

        {/* Footer — always pinned at the bottom */}
        <div className="flex items-center justify-between pt-2 border-t border-border-primary/40 mt-auto">
          {/* Status badge — always reserves the same height */}
          <div className="h-6 flex items-center">
            {video.status && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold uppercase border ${video.status.toUpperCase() === "APPROVED"
                ? "bg-success/10 text-success border-success/20"
                : video.status.toUpperCase() === "PENDING"
                  ? "bg-warning/10 text-warning border-warning/20"
                  : "bg-error/10 text-error border-error/20"
                }`}>
                {video.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-muted-text">
            <div className="flex items-center gap-1 hover:text-brand-primary transition-colors cursor-pointer" title="Like">
              <HandThumbUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{video.likeCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-brand-primary transition-colors cursor-pointer" title="Comment">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{video.commentCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const VideoCard = ({
  video,
  channelId,
  viewType,
  pathname,
  imageError,
  onImageError,
}: VideoCardProps) => {
  const isLocked = video.hasAccess === false;

  const resolveHref = () => {
    if (pathname.includes("/admin/creators")) {
      return `/admin/creators/${channelId || video.channel || video.owner}/${video._id}?channelId=${channelId}`;
    }
    if (pathname === "/mychannel") {
      return `/mychannel/videos/${video._id}?channelId=${channelId}`;
    }
    return `/overview/videos/${video._id}?channelId=${channelId}`;
  };

  if (viewType === "public") {
    return (
      <div className="group flex flex-col h-full gap-y-2 cursor-default select-none">
        <VideoCardContent
          video={video}
          imageError={imageError}
          onImageError={onImageError}
        />
      </div>
    );
  }

  if (isLocked) {
    return (
      <Tooltip title="Get Subscription" placement="top">
        <div
          className="group flex flex-col h-full gap-y-2 cursor-pointer select-none"
          aria-disabled="true"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.hash = "membership";
            }
          }}
        >
          <VideoCardContent
            video={video}
            imageError={imageError}
            onImageError={onImageError}
          />
        </div>
      </Tooltip>
    );
  }

  return (
    <Link href={resolveHref()} className="group flex flex-col h-full gap-y-2 cursor-pointer">
      <VideoCardContent
        video={video}
        imageError={imageError}
        onImageError={onImageError}
      />
    </Link>
  );
};

export default VideoCard;
