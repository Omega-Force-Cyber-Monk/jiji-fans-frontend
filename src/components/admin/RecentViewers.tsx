"use client";
import { useRecentViewersQuery } from "@/redux/features/adminHome/adminHome.api";
import { TUniObject } from "@/types";
import { cn } from "@/utils/cn";
import { Avatar, Skeleton } from "antd";
import React from "react";

const RecentViewers = ({ className }: { className?: string }) => {
  const { data, isLoading } = useRecentViewersQuery(undefined);
  const viewers = Array.isArray(data)
    ? data
    : Array.isArray(data?.recentViewers)
    ? data.recentViewers
    : [];

  return (
    <div
      className={cn(
        "bg-secondary-bg border border-border-primary shadow-sm rounded-xl p-6 h-full min-h-[300px] flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2 border-b border-border-primary/50 pb-4">
        <h3 className="text-xl font-bold text-primary-text">Recent Viewers</h3>
        <p className="text-sm font-medium text-muted-text">{viewers.length} total</p>
      </div>

      <div className="flex-1 space-y-3 py-4">
        {isLoading ? (
          [...Array(4)].map((_, index) => (
            <Skeleton
              key={index}
              paragraph={false}
              round
              loading
              active
              avatar
            ></Skeleton>
          ))
        ) : viewers.length ? (
          <div className="space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
            {viewers.map((viewer: TUniObject) => (
              <div
                key={viewer._id}
                className="flex items-center gap-3 p-3 rounded-lg bg-primary-bg border border-border-primary/50 transition-colors hover:border-brand-primary/30"
              >
                <Avatar
                  src={viewer.user?.avatar || undefined}
                  size={42}
                  className="bg-brand-primary/10 text-brand-primary font-semibold flex items-center justify-center shrink-0"
                >
                  {viewer.user?.username?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary-text truncate">
                    {viewer.user?.username || "Unknown user"}
                  </p>
                  <p className="text-sm font-medium text-muted-text truncate">
                    {viewer.user?.email || "No email"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm font-medium text-muted-text bg-primary-bg rounded-lg border border-border-primary border-dashed">
            No recent viewers found.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentViewers;
