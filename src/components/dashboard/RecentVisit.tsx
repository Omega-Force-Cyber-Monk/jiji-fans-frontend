"use client";
import Image from "@/components/ui/CImage";
import Link from "next/link";
import React from "react";
import { useGetRecentlyViewedQuery } from "@/redux/features/users/users.api";

const RecentVisit = () => {
  const { data, isLoading } = useGetRecentlyViewedQuery({});

  const recentChannels = data?.data?.recentlyViewed || [];

  if (isLoading) {
    return (
      <div className="pt-1">
        <h4 className="font-semibold text-primary-text">Recently visited</h4>
        <div className="space-y-2 pt-2.5">
          <p className="text-sm text-muted-text pl-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (recentChannels.length === 0) {
    return (
      <div className="pt-1">
        <h4 className="font-semibold text-primary-text">Recently visited</h4>
        <div className="space-y-2 pt-2.5">
          <p className="text-sm text-muted-text pl-4">No recent visits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <h4 className="font-semibold text-primary-text">Recently visited</h4>
      <div className="space-y-4 pt-2.5">
        {recentChannels.map((channel: any, index: number) => (
          <Link
            href={`/overview/channels/${channel._id}`}
            key={channel._id || index}
            className="flex items-center gap-2 border border-border-primary px-4 py-2 rounded-lg hover:border-brand-primary group"
          >
            <div className="w-5 rounded overflow-hidden shadow-sm border border-border-primary">
              <Image
                src={
                  channel.avatar ||
                  `/static/demo/channel_${(index % 3) + 1}.png`
                }
                alt={channel.name || "channel"}
                height={500}
                width={500}
                className="w-full aspect-[1/1] object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <p className="font-medium text-sm truncate w-full text-secondary-text group-hover:text-brand-primary transition-colors">
              {channel.name || "Unknown Channel"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentVisit;
