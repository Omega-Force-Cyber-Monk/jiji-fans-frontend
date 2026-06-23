"use client";

import React from "react";
import { Skeleton, Breadcrumb } from "antd";

const ProfileSkeleton = () => {
  return (
    <div className="w-full px-6 py-6 mx-auto space-y-6">
      <Breadcrumb
        items={[
          { title: "Home", href: "/overview" },
          { title: "Profile" },
        ]}
        className="mb-4"
      />

      {/* <div className="flex justify-between items-center pb-2">
        <div className="h-9 w-64 bg-skeleton-bg rounded-md animate-pulse" />
        <div className="h-10 w-32 bg-skeleton-bg rounded-md animate-pulse" />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          {/* Summary Card Skeleton */}
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 flex flex-col items-center gap-4 animate-pulse">
            <Skeleton.Avatar active size={128} shape="circle" />
            <div className="h-6 w-32 bg-skeleton-bg rounded-md" />
            <div className="h-4 w-48 bg-skeleton-bg rounded-md" />
            <div className="h-6 w-16 bg-skeleton-bg rounded-md mt-2" />
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-4 animate-pulse">
            <div className="h-5 w-40 bg-skeleton-bg rounded-md mb-2 border-b border-border-primary pb-2" />
            <div className="h-10 w-full bg-skeleton-bg rounded-md" />
            <div className="h-10 w-full bg-skeleton-bg rounded-md" />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-8">
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-8 space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-skeleton-bg rounded-md mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
              {/* Email */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
              {/* Phone Number */}
              <div className="space-y-2">
                <div className="h-4 w-28 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
              {/* Country */}
              <div className="space-y-2">
                <div className="h-4 w-16 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
              {/* Language */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
              {/* Address (Spans 2 columns) */}
              <div className="md:col-span-2 space-y-2">
                <div className="h-4 w-16 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
