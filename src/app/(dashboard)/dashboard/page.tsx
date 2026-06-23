"use client";

import EarningBarChart from "@/components/dashboard/EarningBarChart";
import SubscriberAreaChart from "@/components/dashboard/SubscriberAreaChart";
import RecentSubscriber from "@/components/dashboard/RecentSubscriber";
import WatchTimeChart from "@/components/dashboard/WatchTimeChart";
import MemberTiersBreakdown from "@/components/dashboard/MemberTiersBreakdown";
import TopPerformingVideos from "@/components/dashboard/TopPerformingVideos";
import CreatorMiniInbox from "@/components/dashboard/CreatorMiniInbox";
import RecentComments from "@/components/dashboard/RecentComments";
import PageHeading from "@/components/ui/PageHeading";
import React from "react";
import { useGetChannelStatsQuery } from "@/redux/features/dashboard/dashboard.api";
import MetricsCard from "@/components/dashboard/MetricsCard";
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const Page = () => {
  const { data: statsData, isLoading } = useGetChannelStatsQuery();

  const stats = statsData?.data;

  // Use retention / churn metrics from API response
  const churnPercent = stats?.churnRate ?? 0;
  const retentionPercent = stats?.retentionRate ?? 100;
  const retentionValue = `${retentionPercent.toFixed(1)}% / ${churnPercent.toFixed(1)}%`;

  const metrics = [
    {
      label: "Total Earnings",
      value: `$${stats?.totalEarnings?.toFixed(2) || "0.00"}`,
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      trend: { value: 12.5, isPositive: true },
    },
    {
      label: "Total Active Subscribers",
      value: stats?.totalSubscribers || 0,
      icon: <UserGroupIcon className="w-6 h-6" />,
      trend: { value: 5.2, isPositive: true },
    },
    {
      label: "Retention / Churn Rate",
      value: retentionValue,
      icon: <ArrowPathIcon className="w-6 h-6" />,
      trend: { value: 1.8, isPositive: true },
    },
    {
      label: "Total Videos",
      value: stats?.totalVideos || 0,
      icon: <VideoCameraIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-8 pb-8 w-full max-w-[1600px] mx-auto animate-fade-in">
      {/* Page Heading */}
      <PageHeading title="Overview" />

      {/* 1. Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, index) => (
          <MetricsCard
            key={index}
            label={item.label}
            value={item.value}
            icon={item.icon}
            trend={item.trend}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* 2. Row 1: Content Assets & Business Demographics (Fixed Height: 480px) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 h-[440px] overflow-y-auto no-scrollbar">
          <TopPerformingVideos />
        </div>
        <div className="lg:col-span-1 bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 h-[440px] overflow-y-auto no-scrollbar">
          <MemberTiersBreakdown className="pt-0 sm:pt-0" />
        </div>
      </div>

      {/* 3. Row 2: Streaming Analytics & Direct Conversations (Fixed Height: 440px) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 h-[480px]">
          <WatchTimeChart />
        </div>
        <div className="lg:col-span-1 bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 h-[480px] overflow-hidden">
          <CreatorMiniInbox showViewAll={true} />
        </div>
      </div>

      {/* 4. Row 3: Growth & Revenue Trend Panels (Fixed Height: 400px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 h-[400px]">
          <EarningBarChart />
        </div>
        <div className="bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 h-[400px]">
          <SubscriberAreaChart />
        </div>
      </div>

      {/* 5. Row 4: Subscribers & Comments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Full-Width Recent Subscribers Data Log with Pagination */}
        <div className="bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 w-full min-h-[380px] h-full">
          <RecentSubscriber
            viewType="creator"
            title="Recent Subscribers"
            subscriptions={stats?.recentSubscriptions || []}
            pagination={true}
            pageSize={5}
            loading={isLoading}
          />
        </div>

        {/* Recent Comments Section */}
        <div className="bg-secondary-bg rounded-lg border border-border-primary p-6 shadow-sm transition-all hover:border-brand-primary duration-300 w-full h-[500px] overflow-hidden flex flex-col">
          <RecentComments />
        </div>
      </div>
    </div>
  );
};

export default Page;
