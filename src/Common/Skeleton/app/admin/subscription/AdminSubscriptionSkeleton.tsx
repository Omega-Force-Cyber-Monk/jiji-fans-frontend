"use client";

import React from "react";
import { Breadcrumb, Skeleton } from "antd";

const AdminSubscriptionSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <Breadcrumb
        items={[{ title: "Admin", href: "/admin/home" }, { title: "Subscriptions" }]}
        className="text-sm"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-skeleton-bg rounded-md" />
          <div className="h-4 w-72 bg-skeleton-bg rounded-md" />
        </div>
        <div className="h-10 w-32 bg-skeleton-bg rounded-md shrink-0" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-4"
          >
            <div className="pb-4 border-b border-border-primary space-y-2">
              <div className="h-5 w-28 bg-skeleton-bg rounded-md" />
              <div className="h-8 w-20 bg-skeleton-bg rounded-md" />
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 w-full bg-skeleton-bg rounded-md" />
              ))}
            </div>
            <div className="pt-4 border-t border-border-primary flex gap-2">
              <div className="flex-1 h-9 bg-skeleton-bg rounded-md" />
              <div className="w-20 h-9 bg-skeleton-bg rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSubscriptionSkeleton;
