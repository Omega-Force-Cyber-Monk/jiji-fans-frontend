"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import ChannelInfo from "@/components/channels/ChannelInfo";
import Videos from "@/components/channels/Videos";
import Membership from "@/components/channels/Membership";
import ChannelAbout from "@/components/channels/ChannelAbout";
import ChannelNavTabs from "@/components/channels/ChannelNavTabs";
import ChannelErrorState from "@/components/channels/ChannelErrorState";

import {
  useGetChannelByIdQuery,
  TContent,
} from "@/redux/features/channel/channel.api";
import { useAddRecentlyViewedMutation } from "@/redux/features/users/users.api";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { errorAlert } from "@/lib/alerts";
import { useAppSelector } from "@/redux/hook";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const channelId = params.slug as string;

  const [activeKey, setActiveKey] = useState<string>("videos");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allContents, setAllContents] = useState<TContent[]>([]);
  const [prevChannelId, setPrevChannelId] = useState<string>(channelId);
  const { messageApi } = useAppContext();

  const { data, isLoading, isError, error } = useGetChannelByIdQuery({
    channelId,
    cursor,
    limit: 8,
  });

  const [addRecentlyViewed] = useAddRecentlyViewedMutation();
  const channelData = data?.data;

  const { user } = useAppSelector((state) => state.auth);
  const isOwnChannel = user?._id === channelData?.owner || user?._id === (channelData?.owner as any)?._id;

  // Redirect away from membership tab if it is the owner's channel
  useEffect(() => {
    if (isOwnChannel && activeKey === "membership") {
      setActiveKey("videos");
    }
  }, [isOwnChannel, activeKey]);

  // Reset state when channelId changes
  useEffect(() => {
    if (prevChannelId !== channelId) {
      setCursor(undefined);
      setAllContents([]);
      setPrevChannelId(channelId);
    }
  }, [channelId, prevChannelId]);

  // Track recently viewed channel
  useEffect(() => {
    if (channelId && !isError) {
      addRecentlyViewed(channelId).catch((err) => {
        errorAlert({ error: err as any, messageApi });
      });
    }
  }, [channelId, addRecentlyViewed, messageApi, isError]);

  // Append new contents when data changes
  useEffect(() => {
    if (channelData?.contents) {
      setAllContents((prev) => {
        if (!cursor) return channelData.contents;
        const newContents = channelData.contents.filter(
          (content) => !prev.some((p) => p._id === content._id),
        );
        return [...prev, ...newContents];
      });
    }
  }, [channelData, cursor]);

  // Sync active tab from URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveKey(hash);
    };

    if (typeof window !== "undefined") {
      handleHashChange();
      window.addEventListener("hashchange", handleHashChange);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("hashchange", handleHashChange);
      }
    };
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

  if (isError) {
    const errorData = error as any;
    if ([400, 403, 404].includes(Number(errorData?.status))) {
      return (
        <ChannelErrorState
          type="unavailable"
          onBack={() => router.back()}
        />
      );
    }
    return (
      <ChannelErrorState
        type="generic"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="container mx-auto space-y-6 xl:space-y-8">
      <ChannelInfo
        channelData={channelData}
        isLoading={isLoading}
        onSelectTab={handleTabChange}
      />

      <ChannelNavTabs activeKey={activeKey} onChange={handleTabChange} hideMembership={isOwnChannel} />

      <div>
        {activeKey === "membership" ? (
          <Membership channelId={channelId} />
        ) : activeKey === "about" ? (
          <ChannelAbout channelData={channelData} />
        ) : (
          <Videos
            contents={allContents}
            pagination={channelData?.pagination}
            isLoading={isLoading && !cursor}
            onLoadMore={handleLoadMore}
            channelId={channelId}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
