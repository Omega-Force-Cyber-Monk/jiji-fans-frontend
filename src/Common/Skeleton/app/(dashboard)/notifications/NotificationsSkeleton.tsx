"use client";

import React from "react";
import { Breadcrumb } from "antd";

const NotificationsSkeleton = () => {
  const skeletons = Array.from({ length: 6 });

  return (
    <div>
      <Breadcrumb
        items={[
          { title: "Home", href: "/overview" },
          { title: "Notifications" },
        ]}
        className="mb-4"
      />
      
      <div className="space-y-3.5 mt-5">
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="px-5 sm:px-[24px] py-4 border-b border-border-primary/50 group relative animate-pulse"
          >
            <div className="flex gap-4 items-start">
              {/* Clean Icon Container Placeholder */}
              <div className="size-10 rounded-lg bg-skeleton-bg shrink-0" />

              {/* Content Details Placeholders */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4.5 w-1/3 bg-skeleton-bg rounded-md" />
                <div className="h-3.5 w-3/4 bg-skeleton-bg rounded-md mt-1" />
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="size-1 bg-skeleton-bg rounded-full" />
                  <div className="h-3 w-16 bg-skeleton-bg rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsSkeleton;
