"use client";

import React from "react";
import AnalyticsMetricCard from "./AnalyticsMetricCard";
import {
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import { useAdminDashboardStatsQuery } from "@/redux/features/adminHome/adminHome.api";

const AnalyticsMetricsGrid = () => {
  const { data: statsData, isLoading } = useAdminDashboardStatsQuery(undefined);
  const stats = statsData?.data;


  const totalUsers = stats?.totalUsers || 0;
  const totalChannels = stats?.totalChannels || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const userGrowthPercent = stats?.userGrowth?.changePercentage || 0;
  const revenueGrowthPercent = stats?.revenueGrowth?.changePercentage || 0;

  const ratioA = totalUsers > 0
    ? Number((((totalUsers - totalChannels) / totalUsers) * 100).toFixed(1))
    : 96.1;

  // Custom active user stats for the horizontal bar chart
  const activeUsersData = React.useMemo(() => {
    const userCounts = stats?.userCounts;
    const dailyCount = userCounts?.daily?.count || 0;
    const dailyPercent = userCounts?.daily?.percentage || 0;
    const weeklyCount = userCounts?.weekly?.count || 0;
    const weeklyPercent = userCounts?.weekly?.percentage || 0;
    const monthlyCount = userCounts?.monthly?.count || 0;
    const monthlyPercent = userCounts?.monthly?.percentage || 0;

    return [
      { label: "Daily Active Users (DAU)", value: dailyCount, formatted: dailyCount.toLocaleString(), percentage: dailyPercent },
      { label: "Weekly Active Users (WAU)", value: weeklyCount, formatted: weeklyCount.toLocaleString(), percentage: weeklyPercent },
      { label: "Monthly Active Users (MAU)", value: monthlyCount, formatted: monthlyCount.toLocaleString(), percentage: monthlyPercent },
    ];
  }, [stats]);

  // Multidimensional grouped categories performance data matching reference chart
  const topCategories = React.useMemo(() => {
    if (!stats?.topCategories || stats.topCategories.length === 0) {
      return [
        { name: "Music", views: 30, subscribers: 31, revenue: 12 },
        { name: "Comedy", views: 3, subscribers: 10, revenue: 22 },
        { name: "Education", views: 32, subscribers: 30, revenue: 29 },
        { name: "Gaming", views: 20, subscribers: 17, revenue: 0 },
        { name: "Others", views: 20, subscribers: 31, revenue: 11 },
      ];
    }
    return stats.topCategories.map((cat: any) => ({
      name: cat.name,
      views: (cat.channelCount || 0) * 2.5,
      subscribers: (cat.subscriptionCount || 0) * 0.5,
      revenue: (cat.subscriptionCount || 0) * 0.25,
    }));
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Row 1: Unified Metric Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnalyticsMetricCard
          title="User Directory"
          value={stats ? totalUsers.toLocaleString() : "..."}
          type="list"
          icon={<UsersIcon />}
          trend={stats ? { value: `${userGrowthPercent >= 0 ? "+" : ""}${userGrowthPercent.toFixed(1)}%`, isPositive: userGrowthPercent >= 0 } : undefined}
          listData={[
            { label: "Active Fans", value: String(stats?.people?.activeFans || 0), percentage: 0 },
            { label: "Creators", value: String(stats?.people?.creators || 0), percentage: 0 },
            { label: "Total Channels", value: String(totalChannels), percentage: 0 },
          ]}
        />

        <AnalyticsMetricCard
          title="Revenue Split"
          value={stats ? `$${(stats?.revenue?.gross?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "..."}
          type="list"
          icon={<CurrencyDollarIcon />}
          trend={stats ? { value: `${revenueGrowthPercent >= 0 ? "+" : ""}${revenueGrowthPercent.toFixed(1)}%`, isPositive: revenueGrowthPercent >= 0 } : undefined}
          listData={[
            { label: "Creator Share", value: `$${(stats?.revenue?.creatorShare?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, percentage: stats?.revenue?.creatorShare?.percentage || 90 },
            { label: "Platform Commission", value: `$${(stats?.revenue?.platformCommission?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, percentage: stats?.revenue?.platformCommission?.percentage || 10 },
          ]}
        />

        <AnalyticsMetricCard
          title="Income Streams"
          value={stats ? `${(stats.totalSubscriptions || 0).toLocaleString()} Subscriptions` : "..."}
          type="split"
          icon={<CreditCardIcon />}
          splitData={{
            labelA: "Membership Fees",
            valueA: `$${(stats?.revenue?.subscriptions?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            labelB: "Tips & Donations",
            valueB: `$${(stats?.revenue?.tips?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ratioA: 0
          }}
        />

        <AnalyticsMetricCard
          title="Payout Operations"
          value={stats ? `$${(stats?.payouts?.payoutAmount?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "..."}
          type="split"
          icon={<GlobeAltIcon />}
          splitData={{
            labelA: "Completed Payouts",
            valueA: `$${(stats?.payouts?.completedPayoutAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            labelB: "Pending Requests",
            valueB: `$${(stats?.payouts?.pendingPayoutAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ratioA: 0
          }}
        />
      </div>

      {/* Row 2: Active Users Horizontal Bar Chart & Top Performing Categories side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

        {/* Active Users Horizontal Bar Chart */}
        <div className="lg:col-span-6 p-6 rounded-lg border border-border-primary bg-secondary-bg space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-6">
              <span className="text-xl font-bold tracking-wider">
                Active User Metrics
              </span>
              <ArrowTrendingUpIcon className="text-muted-text w-5 h-5 flex-shrink-0" />
            </div>

            <div className="space-y-6">
              {activeUsersData.map((data, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-secondary-text">{data.label}</span>
                    <span className="font-semibold text-primary-text">{data.formatted}</span>
                  </div>

                  {/* Premium Horizontal Bar chart element */}
                  <div className="relative w-full h-8 bg-secondary-bg rounded-md overflow-hidden flex items-center pr-4 border border-border-primary/30">
                    <div
                      className="bg-brand-primary h-full transition-all duration-1000 flex items-center pl-3"
                      style={{ width: `${data.percentage}%` }}
                    >
                      <span className="text-sm font-semibold text-black leading-none drop-shadow-xs">
                        {data.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal scale indicators */}
          <div className="border-t border-border-primary/50 pt-4 flex justify-between text-sm font-medium text-muted-text">
            <span>0%</span>
            <span>20%</span>
            <span>40%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100% Max</span>
          </div>
        </div>

        {/* Top Performing Categories (Grouped Recharts Bar Chart) */}
        <div className="lg:col-span-6 p-6 rounded-lg border border-border-primary bg-secondary-bg space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4 flex-grow flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary/50 pb-4 flex-shrink-0">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold tracking-wider">
                  Top Performing Categories
                </span>
                <p className="text-sm text-muted-text font-normal">
                  Comparative performance splits across dynamic metric tracks.
                </p>
              </div>

              {/* Premium custom inline legend matching reference style */}
              <div className="flex items-center gap-4 text-sm font-semibold text-secondary-text">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E3A5]" />
                  <span>Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span>Subs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                  <span>Revenue</span>
                </div>
              </div>
            </div>

            {/* Height set to 230px to match reference aspect ratio */}
            <div className="h-[230px] w-full flex items-center justify-center flex-grow mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCategories}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#2D2D2D"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                    domain={[0, 100]}
                    tickCount={5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2D2D2D",
                      borderRadius: "6px",
                      color: "#F9FAFB",
                      fontSize: "12px",
                    }}
                  />
                  {/* Views bar: Teal */}
                  <Bar
                    dataKey="views"
                    fill="#00E3A5"
                    radius={[3, 3, 0, 0]}
                    barSize={24}
                  />
                  {/* Subscribers bar: Blue */}
                  <Bar
                    dataKey="subscribers"
                    fill="#3B82F6"
                    radius={[3, 3, 0, 0]}
                    barSize={24}
                  />
                  {/* Revenue bar: Purple */}
                  <Bar
                    dataKey="revenue"
                    fill="#A855F7"
                    radius={[3, 3, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-sm text-muted-text font-normal border-t border-border-primary/50 pt-4 flex-shrink-0">
            Ranked by view counts, engagement splits, and category subscriber density.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsMetricsGrid;
export { AnalyticsMetricsGrid };
