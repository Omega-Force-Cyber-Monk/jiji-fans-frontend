"use client";
import React, { useMemo, useState } from "react";
import { Skeleton } from "antd";
import CountryMarketShareChart from "@/components/admin/CountryMarketShareChart";
import RecentSubscriber from "@/components/dashboard/RecentSubscriber";
import { formatTwoDigits } from "@/lib/helpers/getTwoDisit";
import {
  useAdminStatsQuery,
  useRecentUserQuery,
  useDiviceStatusQuery,
  useGetSystemLogsQuery,
} from "@/redux/features/adminHome/adminHome.api";
import { cn } from "@/utils/cn";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import {
  BanknotesIcon,
  UsersIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
} from "@heroicons/react/24/outline";
import CreatorMiniInbox from "@/components/dashboard/CreatorMiniInbox";
import SystemOperationsLog from "@/components/admin/SystemOperationsLog";

// Mock support/short chats for the "Short Chat" card
const MOCK_SUPPORT_CHATS = [
  {
    id: "1",
    user: "Emma Watson",
    avatar: "/static/demo/channel_1.png",
    message: "Need help resolving my pending KYC submission...",
    time: "2m ago",
    status: "warning", // Maps to warning token
    priority: "High",
  },
  {
    id: "2",
    user: "Liam Neeson",
    avatar: "/static/demo/channel_1.png",
    message: "Is there a limit on daily payouts for creators?",
    time: "15m ago",
    status: "success", // Maps to success token
    priority: "Normal",
  },
  {
    id: "3",
    user: "Sophia Loren",
    avatar: "/static/demo/channel_1.png",
    message: "Reporting offensive behavior on a live stream.",
    time: "1h ago",
    status: "error", // Maps to error token
    priority: "Critical",
  },
];


const Page = () => {
  const { data: statsData, isLoading: isStatsLoading, isError: isStatsError } = useAdminStatsQuery(undefined);
  const { data: recentUserData } = useRecentUserQuery(undefined);
  const { data: deviceData, isLoading: isDeviceLoading } = useDiviceStatusQuery(undefined);

  const { data: logsData, isLoading: isLogsLoading } = useGetSystemLogsQuery({ limit: 10 });

  const transactions = useMemo(() => {
    const results = logsData?.data?.results || [];
    return results.map((log: any) => ({
      key: log._id,
      id: log._id ? log._id.substring(log._id.length - 8).toUpperCase() : "LOG",
      creator: log.actorId?.username || log.actorId?.name || "System",
      type: log.actionType || "System Action",
      amount: log.metadata?.amount ? `$${log.metadata.amount.toLocaleString()}` : "--",
      date: log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      }) : "N/A",
      status: ["success", "completed", "succeeded"].includes(log.status?.toLowerCase() || "")
        ? "success"
        : ["pending", "warning", "processing"].includes(log.status?.toLowerCase() || "")
        ? "warning"
        : "error",
      label: log.status || "Unknown",
    }));
  }, [logsData]);

  // Re-map the stats metrics using strictly allowed color design tokens
  const statusMetrics = useMemo(() => {
    return [
      {
        label: "Total Earnings",
        value: `$${formatTwoDigits({ num: statsData?.data?.totalEarnings || 0 })}`,
        icon: BanknotesIcon,
        color: "text-brand-primary",
        bg: "bg-brand-primary/10",
        border: "border-brand-primary/20",
      },
      {
        label: "Total Users",
        value: formatTwoDigits({ num: statsData?.data?.totalUsers || 0 }),
        icon: UsersIcon,
        color: "text-brand-secondary",
        bg: "bg-brand-secondary/10",
        border: "border-brand-secondary/20",
      },
      {
        label: "Total Videos",
        value: formatTwoDigits({ num: statsData?.data?.totalContents || 0 }),
        icon: VideoCameraIcon,
        color: "text-success",
        bg: "bg-success/10",
        border: "border-success/20",
      },
      {
        label: "Total Withdrawals",
        value: `$${formatTwoDigits({ num: statsData?.data?.totalWithdrawalsAmount || 0 })}`,
        icon: BanknotesIcon,
        color: "text-success",
        bg: "bg-success/10",
        border: "border-success/20",
      },
      {
        label: "Creator Earnings",
        value: `$${formatTwoDigits({ num: statsData?.data?.creatorEarnings || 0 })}`,
        icon: BanknotesIcon,
        color: "text-brand-primary",
        bg: "bg-brand-primary/10",
        border: "border-brand-primary/20",
      },
      {
        label: "System Earnings",
        value: `$${formatTwoDigits({ num: statsData?.data?.systemEarnings || 0 })}`,
        icon: BanknotesIcon,
        color: "text-warning",
        bg: "bg-warning/10",
        border: "border-warning/20",
      },
    ];
  }, [statsData]);

  // Compute total count from device metrics dynamically
  const deviceStatsComputed = useMemo(() => {
    const statsList = deviceData?.deviceStats;
    if (!statsList || !Array.isArray(statsList)) {
      return [];
    }

    const total = statsList.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 1;
    return statsList.map((item: any) => {
      let icon = ComputerDesktopIcon;
      const deviceName = item.device || "Unknown";
      if (deviceName.toLowerCase().includes("mobile")) icon = DevicePhoneMobileIcon;
      if (deviceName.toLowerCase().includes("tablet")) icon = DeviceTabletIcon;

      const label = deviceName.charAt(0).toUpperCase() + deviceName.slice(1).toLowerCase();

      return {
        label,
        percentage: item.percentage ?? Math.round(((item.count || 0) / total) * 100),
        count: item.count || 0,
        icon,
      };
    });
  }, [deviceData]);

  return (
    <div className="w-full space-y-6 pb-6">
      {/* Breadcrumbs & Header Title */}
      <div className="flex flex-col gap-3">
        <AppBreadcrumb
          items={[
            { title: "Admin", href: "/admin/home" },
            { title: "Overview" },
          ]}
        />
        <div className="space-y-1">
        </div>
      </div>

      {isStatsError && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-center text-sm font-medium">
          Failed to load admin statistics. Please refresh the page.
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statusMetrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={cn(
                "p-5 rounded-lg border bg-secondary-bg shadow-sm transition-all hover:shadow-md",
                item.border
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", item.bg)}>
                  <Icon className={cn("w-5 h-5", item.color)} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-text">{item.label}</p>
                {isStatsLoading ? (
                  <Skeleton.Input active size="small" />
                ) : (
                  <h3 className="text-2xl font-semibold text-primary-text">{item.value}</h3>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics, Charts & Device Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="xl:col-span-2 bg-secondary-bg border border-border-primary rounded-lg p-5 shadow-sm overflow-hidden flex flex-col justify-between h-[380px] hover:border-brand-primary">

          <div className="w-full flex-1 min-h-0">
            <CountryMarketShareChart className="!pt-0" />
          </div>
        </div>

        {/* Device Traffic Analytics */}
        <div className="bg-secondary-bg border border-border-primary rounded-lg p-5 shadow-sm flex flex-col justify-between h-[380px] hover:border-brand-primary">
          <div className="mb-4 shrink-0">
            <h3 className="text-lg font-semibold text-primary-text">Device Distribution</h3>
            <p className="text-sm text-muted-text font-normal mt-0.5">Traffic share by hardware platforms</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center min-h-0">
            {isDeviceLoading ? (
              <div className="space-y-4">
                <Skeleton.Input active size="default" block />
                <Skeleton.Input active size="default" block />
                <Skeleton.Input active size="default" block />
              </div>
            ) : (
              deviceStatsComputed.map((item, idx) => {
                const DeviceIcon = item.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-secondary-bg border border-border-primary flex items-center justify-center shrink-0">
                          <DeviceIcon className="w-4 h-4 text-brand-primary" />
                        </div>
                        <span className="text-sm font-medium text-primary-text">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary-text">{item.percentage}%</span>
                    </div>
                    {/* Premium progress bar */}
                    <div className="w-full h-1.5 bg-primary-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Support Chat & Recent Registrations Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 ">
        {/* Short Support Chat Feed */}
        <div className="xl:col-span-1 bg-secondary-bg rounded-lg border border-border-primary p-4 sm:p-6 shadow-sm transition-all hover:border-brand-primary duration-300 h-[520px] overflow-hidden">
          <CreatorMiniInbox showViewAll={true} />
        </div>

        {/* Recent Subscriber / Registrations Component */}
        <div className="xl:col-span-2 bg-secondary-bg border border-border-primary rounded-lg p-5 shadow-sm flex flex-col justify-between overflow-hidden h-[520px] hover:border-brand-primary">
          <div className="shrink-0 mb-5">
            <h3 className="text-lg font-semibold text-primary-text">Recent Registrations</h3>
            <p className="text-sm text-muted-text font-normal mt-0.5">New user signups and onboardings</p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <RecentSubscriber title="" subscriptions={(Array.isArray(recentUserData?.data) ? recentUserData.data : []).slice(0, 6)} viewType="admin" />
          </div>
        </div>
      </div>

      {/* Detailed Operations & Site Statistic Table Component */}
      <SystemOperationsLog
        transactions={transactions}
        loading={isLogsLoading}
        isDashboard={true}
      />
    </div>
  );
};

export default Page;
