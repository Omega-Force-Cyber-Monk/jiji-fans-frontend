"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Tabs, TabsProps, Select, Breadcrumb } from "antd";
import { UserGroupIcon, VideoCameraIcon, StarIcon } from "@heroicons/react/24/outline";
import ChannelInfo from "@/components/channels/ChannelInfo";
import Videos from "@/components/channels/Videos";
import Membership from "@/components/channels/Membership";
import ChannelAbout from "@/components/channels/ChannelAbout";
import { useAppSelector } from "@/redux/hook";
import { useGetMyChannelQuery, useGetContentsByOwnerQuery, TChannelStatus } from "@/redux/features/channel/channel.api";
import ChannelStatusGuard from "@/components/guards/ChannelStatusGuard";
import SectionContainer from "@/components/ui/SectionContainer";
import StatusBanner from "./_components/StatusBanner";
import StatCard from "./_components/StatCard";
import MyChannelSkeleton from "@/Common/Skeleton/app/(dashboard)/mychannel/MyChannelSkeleton";
import CreateChannelForm from "./_components/CreateChannelForm";

const Page = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeKey, setActiveKey] = useState<string>("videos");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [limit] = useState<number>(12); // Slightly more for better grid
  const [status, setStatus] = useState<TChannelStatus | "ALL" | undefined>(undefined);

  const isCreator = user?.role?.toLowerCase() === "creator";

  const { data: channelData, isLoading, error } = useGetMyChannelQuery({
    cursor,
    limit,
  }, {
    skip: !isCreator
  });

  const { data: ownerContentsData, isLoading: isContentsLoading } = useGetContentsByOwnerQuery(
    user?._id as string,
    { skip: !user?._id || !isCreator }
  );

  const channelStatus = channelData?.data?.status;

  const handleStatusChange = (value: string) => {
    setStatus(value as TChannelStatus | "ALL");
  };

  const filteredContents = useMemo(() => {
    const list = ownerContentsData?.data || [];
    if (!status || status === "ALL") {
      return list;
    }
    return list.filter((c) => c.status?.toUpperCase() === status.toUpperCase());
  }, [ownerContentsData, status]);

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

  const onChange = (key: string) => {
    setActiveKey(key);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${key}`);
    }
  };

  const handleLoadMore = (direction: 'next' | 'previous') => {
    if (direction === 'next' && channelData?.data.pagination.nextCursor) {
      setCursor(channelData.data.pagination.nextCursor);
    } else if (direction === 'previous' && channelData?.data.pagination.previousCursor) {
      setCursor(channelData.data.pagination.previousCursor);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "videos",
      label: "Videos",
    },
    ...(user?.role.toLowerCase() !== "creator"
      ? [
        {
          key: "membership",
          label: "Memberships",
        },
      ]
      : []),
    {
      key: "about",
      label: "About",
    },
  ];

  if (!isCreator) {
    return (
      <div className="">
        <CreateChannelForm />
      </div>
    );
  }

  if (isLoading && !channelData) {
    return (
      <div>
        <MyChannelSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <SectionContainer className="pt-12 text-center h-[60vh] flex flex-col justify-center items-center">
        <VideoCameraIcon className="w-16 h-16 text-muted-text mb-4" />
        <h2 className="text-2xl font-semibold text-primary-text mb-2">No Channel Found</h2>
        <p className="text-secondary-text mb-6">
          {"data" in error && (error.data as any)?.message
            ? (error.data as any).message
            : "You do not have a channel yet. Please create one to access this page."}
        </p>
      </SectionContainer>
    );
  }

  return (
    <ChannelStatusGuard channelStatus={channelStatus} isLoading={isLoading}>
      <div className="animate-in fade-in duration-700 pb-16 space-y-6">
        <div className="flex items-center justify-between pt-4 pb-2">
          <Breadcrumb
            items={[
              { title: "Home", href: "/dashboard" },
              { title: "My Channel" },
            ]}
          />
        </div>

        {/* Status Notification - Centered */}
        {channelStatus && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <StatusBanner status={channelStatus} />
          </div>
        )}

        {/* Hero Section - Elevated Floating Card */}
        <div className="w-full bg-secondary-bg/40 backdrop-blur-md overflow-hidden border border-border-primary rounded-2xl shadow-xl hover:shadow-2xl hover:border-brand-primary/35 transition-all duration-500 pb-6">
          <ChannelInfo channelData={channelData?.data} isLoading={isLoading} />
        </div>

        <div className="space-y-8 mt-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            <StatCard
              label="Total Members"
              value={channelData?.data?.totalSubscribers || 0}
              icon={<UserGroupIcon className="w-6 h-6" />}
            />
            <StatCard
              label="Uploaded Videos"
              value={channelData?.data?.totalVideos || 0}
              icon={<VideoCameraIcon className="w-6 h-6" />}
            />
            <StatCard
              label="Channel Points"
              value="Coming Soon"
              icon={<StarIcon className="w-6 h-6" />}
            />
          </div>

          {/* Content Explorer Card */}
          <div className="bg-secondary-bg/30 backdrop-blur-md border border-border-primary rounded-2xl shadow-xl overflow-hidden hover:border-brand-primary/20 transition-all duration-500">
            <div className="p-3 sm:p-4 border-b border-border-primary bg-primary-bg/15">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                <Tabs
                  activeKey={activeKey}
                  items={items}
                  onChange={onChange}
                  className="flex-1 custom-tabs"
                />
                {activeKey === "videos" && (
                  <div className="flex items-center gap-3 pb-2 md:pb-0 animate-in fade-in duration-300">
                    <span className="text-xs font-semibold text-secondary-text uppercase hidden sm:block tracking-wider">Filter:</span>
                    <Select
                      defaultValue="ALL"
                      onChange={handleStatusChange}
                      className="w-full md:w-48 h-10 custom-select"
                      popupClassName="custom-select-dropdown"
                      options={[
                        { value: "ALL", label: "All Status" },
                        { value: "PENDING", label: "Pending" },
                        { value: "APPROVED", label: "Approved" },
                        { value: "REJECTED", label: "Rejected" },
                        { value: "SUSPENDED", label: "Suspended" },
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 min-h-[400px]">
              {activeKey === "membership" ? (
                <Membership />
              ) : activeKey === "about" ? (
                <ChannelAbout channelData={channelData?.data} />
              ) : (
                <Videos
                  contents={filteredContents}
                  pagination={undefined}
                  isLoading={(isLoading || isContentsLoading) && cursor === undefined}
                  onLoadMore={handleLoadMore}
                  channelId={channelData?.data?._id}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ChannelStatusGuard>
  );
};

export default Page;
