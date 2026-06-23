"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsProps, Select } from "antd";
import ChannelInfo from "@/components/channels/ChannelInfo";
import Videos from "@/components/channels/Videos";
import Membership from "@/components/channels/Membership";
import ChannelAbout from "@/components/channels/ChannelAbout";
import { useAppSelector } from "@/redux/hook";
import { useParams } from "next/navigation";
import {
  useAdminChannelDetailsQuery,
  useGetMyChannelQuery,
  useGetChannelByIdQuery,
  TChannelStatus,
} from "@/redux/features/channel/channel.api";
import { TQuery } from "@/types";
import CPagination from "@/components/ui/CPagination";

const Page = () => {
  const { slug } = useParams();
  console.log(slug)
  const [query, setQuery] = useState<TQuery<{ status?: string }>>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetChannelByIdQuery({
    channelId: slug as string,
    page: query.page,
    limit: query.limit,
    status: query.status as TChannelStatus,
  });
  const channelData = data?.data;
  const contents = channelData?.contents;
  console.log(channelData, "Channel Data", contents, "Contents");
  const handleStatusChange = (value: string) => {
    setQuery((prev) => ({
      ...prev,
      status: value === "ALL" ? undefined : value,
      page: 1,
    }));
  };

  return (
    <div className="space-y-5 xl:space-y-7">
      <ChannelInfo channelData={channelData} isLoading={isLoading} />
      <div className="max-w-[95%] sm:max-w-[90%] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Channel Videos</h2>
          <Select
            defaultValue="ALL"
            onChange={handleStatusChange}
            className="w-full md:w-40 h-10"
            options={[
              { value: "ALL", label: "All Status" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "SUSPENDED", label: "Suspended" },
            ]}
          />
        </div>
        <Videos
          contents={contents}
          channelId={channelData?._id}
          isLoading={isLoading}
          viewType="admin"
        />
      </div>
      <CPagination
        setQuery={setQuery}
        query={query}
        totalData={data?.data?.pagination?.total}
        showSizeChanger={false}
        showQuickJumper={false}
        customNavigation={false}
        size="default"
        className="py-0 pt-2.5"
      />
    </div>
  );
};

export default Page;
