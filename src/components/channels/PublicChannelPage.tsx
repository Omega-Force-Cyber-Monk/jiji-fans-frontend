"use client";

import React, { useEffect, useState, useCallback } from "react";
import ChannelInfo from "@/components/channels/ChannelInfo";
import Videos from "@/components/channels/Videos";
import Membership from "@/components/channels/Membership";
import ChannelAbout from "@/components/channels/ChannelAbout";
import ChannelNavTabs from "@/components/channels/ChannelNavTabs";
import ChannelErrorState from "@/components/channels/ChannelErrorState";
import {
  useGetChannelBySlugQuery,
  TContent,
} from "@/redux/features/channel/channel.api";

interface PublicChannelPageProps {
  slug: string;
}

const PublicChannelPage = ({ slug }: PublicChannelPageProps) => {
  const [activeKey, setActiveKey] = useState<string>("videos");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allContents, setAllContents] = useState<TContent[]>([]);
  const [prevSlug, setPrevSlug] = useState<string>(slug);

  const { data, isLoading, isError } = useGetChannelBySlugQuery({
    slug,
    cursor,
    limit: 8,
  });

  const channelData = data?.data;

  // Reset when slug changes
  useEffect(() => {
    if (prevSlug !== slug) {
      setCursor(undefined);
      setAllContents([]);
      setPrevSlug(slug);
    }
  }, [slug, prevSlug]);

  // Append contents
  useEffect(() => {
    if (channelData?.contents) {
      setAllContents((prev) => {
        if (!cursor) return channelData.contents;
        const newContents = channelData.contents.filter(
          (content) => !prev.some((item) => item._id === content._id),
        );
        return [...prev, ...newContents];
      });
    }
  }, [channelData, cursor]);

  // Sync active tab from URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveKey(hash);
    }
  }, []);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${key}`);
    }
  };

  const handleLoadMore = useCallback(
    (direction: "next" | "previous") => {
      if (direction === "next" && channelData?.pagination?.nextCursor) {
        setCursor(channelData.pagination.nextCursor);
      } else if (
        direction === "previous" &&
        channelData?.pagination?.previousCursor
      ) {
        setCursor(channelData.pagination.previousCursor);
      }
    },
    [channelData?.pagination],
  );

  if (isError && !isLoading) {
    return <ChannelErrorState type="unavailable" />;
  }

  return (
    <div className="space-y-5 xl:space-y-7">
      <ChannelInfo
        channelData={channelData}
        isLoading={isLoading}
        onSelectTab={handleTabChange}
        backFallbackPath="/overview/channels"
      />

      <div className="max-w-[95%] sm:max-w-[90%] mx-auto">
        <ChannelNavTabs activeKey={activeKey} onChange={handleTabChange} />
      </div>

      <div>
        {activeKey === "membership" ? (
          <Membership channelId={channelData?._id} />
        ) : activeKey === "about" ? (
          <ChannelAbout channelData={channelData} />
        ) : (
          <Videos
            contents={allContents}
            pagination={channelData?.pagination}
            isLoading={isLoading && !cursor}
            onLoadMore={handleLoadMore}
            channelId={channelData?._id}
            viewType="public"
          />
        )}
      </div>
    </div>
  );
};

export default PublicChannelPage;
