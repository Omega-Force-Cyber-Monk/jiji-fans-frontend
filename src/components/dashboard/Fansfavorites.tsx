"use client";

import { cn } from "@/utils/cn";
import { ChevronRightIcon, FireIcon } from "@heroicons/react/20/solid";
import Image from "@/components/ui/CImage";
import React, { useState } from "react";
import { useGetPopularChannelsQuery } from "@/redux/features/channel/channel.api";
import { Empty, Skeleton } from "antd";
import Link from "next/link";
import { resolveChannelSlug } from "@/lib/helpers/channelSlug";

interface ChannelItemProps {
  channel: {
    _id: string;
    name: string;
    avatar: string;
    description?: string;
    totalSubscribers?: number;
    slug?: string;
  };
  rank: number;
}

const ChannelItem = ({ channel, rank }: ChannelItemProps) => {
  const [imageError, setImageError] = useState(false);
  const slug = resolveChannelSlug(channel);

  return (
    <Link
      href={`/overview/channels/${channel._id}`}
      className="group relative flex items-center gap-x-3 w-full bg-secondary-bg/50 border border-border-primary rounded-xl p-3 transition-all duration-300 hover:bg-secondary-bg hover:border-border-primary/50 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Rank Indicator */}
      <div className={cn(
        "absolute top-0 right-0 px-2 py-1 rounded-bl-lg text-sm font-semibold uppercase tracking-wider transition-colors",
        rank <= 3 ? "bg-brand-primary text-white" : "bg-brand-primary/10 text-brand-primary"
      )}>
        #{rank}
      </div>

      {/* Avatar Container */}
      <div className="relative h-12 w-12 shrink-0">
        <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-border-primary bg-secondary-bg transition-transform duration-500 size-14 group-hover:scale-110">
          {channel.avatar && !imageError ? (
            <Image
              src={channel.avatar}
              alt={channel.name}
              fill
              quality={100}
              className="object-cover rounded-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-brand-primary/5">
              <span className="text-lg font-bold text-brand-primary">
                {channel.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {rank <= 3 && (
          <div className="absolute -bottom-1 -right-1 bg-primary-bg rounded-full p-0.5 shadow-sm">
            <FireIcon className="w-3 h-3 text-orange-500" />
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <h5 className="font-semibold truncate text-primary-text group-hover:text-brand-primary transition-colors">
          {channel.name}
        </h5>
        {channel.description && (
          <p className="text-sm leading-tight line-clamp-1 text-secondary-text">
            {channel.description}
          </p>
        )}
        {typeof channel.totalSubscribers === "number" && (
          <p className="text-xs text-muted-text font-medium">
            {channel.totalSubscribers.toLocaleString()} {channel.totalSubscribers === 1 ? 'subscriber' : 'subscribers'}
          </p>
        )}
      </div>

      {/* Action Arrow */}
      <ChevronRightIcon className="w-5 h-5 text-muted-text group-hover:text-brand-primary transition-all group-hover:translate-x-1" />
    </Link>
  );
};

const favoriteSkeletonRows = Array.from({ length: 6 }, (_, index) => index);

const FansFavoritesSkeleton = () => (
  <div className="space-y-3.5">
    {favoriteSkeletonRows.map((row) => (
      <div
        key={row}
        className="flex items-center gap-x-3 w-full border border-border-primary rounded-xl p-3 bg-secondary-bg/30"
      >
        <Skeleton.Avatar active size={48} shape="circle" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton.Input active size="small" className="!w-2/3 !h-4" />
          <Skeleton.Input active size="small" className="!w-11/12 !h-3" />
        </div>
      </div>
    ))}
  </div>
);

const Fansfavorites = ({ className }: { className?: string }) => {
  const { data, isLoading } = useGetPopularChannelsQuery({ limit: 6 });
  const rawData = data?.data;
  const channels =
    rawData && typeof rawData === "object" && "results" in rawData && Array.isArray(rawData.results)
      ? rawData.results
      : Array.isArray(rawData)
        ? rawData
        : [];

  return (
    <div
      className={cn(
        "h-fit w-full bg-primary-bg/80 backdrop-blur-xl border border-border-primary rounded-2xl p-5 md:min-w-0",
        className
      )}
    >
      <div className="xl:flex items-center justify-between mb-6 space-y-2">
        <h1 className="text-xl font-semibold text-primary-text tracking-tight">
          Fans Favorites
        </h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit bg-brand-primary/10 text-brand-primary text-sm font-semibold uppercase tracking-wider">
          <FireIcon className="w-3.5 h-3.5" />
          Popular
        </div>
      </div>

      <div className="space-y-3.5">
        {isLoading ? (
          <FansFavoritesSkeleton />
        ) : channels.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-bg flex items-center justify-center mb-4">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={false}
              />
            </div>
            <p className="text-secondary-text text-sm">No popular channels yet</p>
          </div>
        ) : (
          channels.map((channel, index) => (
            <ChannelItem key={channel._id} channel={channel} rank={index + 1} />
          ))
        )}
      </div>

      {/* Mobile Controls */}


      {/* Footer Info (Subtle) */}
      <div className="mt-6 pt-6 border-t border-brand-primary/5 text-center">
        <p className="text-sm text-muted-text uppercase tracking-widest font-medium">
          Top Creators this week
        </p>
      </div>
    </div>
  );
};

export default Fansfavorites;

