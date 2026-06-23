"use client";

import React from "react";
import { Breadcrumb } from "antd";

const AdminSettingsSlugSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Settings", href: "/admin/settings" },
          { title: "..." },
        ]}
        className="text-sm"
      />

      {/* Page Header Skeleton */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg px-6 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-skeleton-bg rounded-md shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-skeleton-bg rounded-md" />
            <div className="h-4 w-56 bg-skeleton-bg rounded-md" />
          </div>
        </div>
        <div className="h-9 w-32 bg-skeleton-bg rounded-md" />
      </div>

      {/* Content Body Skeleton */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Title */}
          <div className="pb-4 border-b border-border-primary">
            <div className="h-6 w-48 bg-skeleton-bg rounded-md" />
          </div>
          {/* Content lines */}
          <div className="space-y-3 py-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-4 bg-skeleton-bg rounded-md ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
          <div className="h-4 w-full bg-skeleton-bg rounded-md" />
          <div className="space-y-3 py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-4 bg-skeleton-bg rounded-md ${i % 2 === 1 ? "w-3/4" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsSlugSkeleton;
