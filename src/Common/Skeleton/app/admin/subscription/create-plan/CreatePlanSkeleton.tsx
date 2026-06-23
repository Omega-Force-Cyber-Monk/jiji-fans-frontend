"use client";

import React from "react";
import { Breadcrumb } from "antd";

const CreatePlanSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <Breadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Subscriptions", href: "/admin/subscription" },
          { title: "Create Plan" },
        ]}
        className="text-sm"
      />

      {/* Page Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-skeleton-bg rounded-md" />
        <div className="h-4 w-80 bg-skeleton-bg rounded-md" />
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="xl:col-span-7 bg-secondary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border-primary">
            <div className="h-5 w-32 bg-skeleton-bg rounded-md" />
          </div>
          <div className="p-6 space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
            ))}
            <div className="space-y-2">
              <div className="h-4 w-36 bg-skeleton-bg rounded-md" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-10 w-full bg-skeleton-bg rounded-md" />
              ))}
              <div className="h-10 w-full bg-skeleton-bg rounded-md border-dashed" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="flex-1 h-11 bg-skeleton-bg rounded-md" />
              <div className="flex-1 h-11 bg-skeleton-bg rounded-md" />
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="xl:col-span-5 bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-primary space-y-1">
            <div className="h-5 w-28 bg-skeleton-bg rounded-md" />
            <div className="h-4 w-44 bg-skeleton-bg rounded-md" />
          </div>
          <div className="p-6 flex items-center justify-center">
            <div className="w-full max-w-sm bg-primary-bg border border-border-primary rounded-lg p-6 space-y-4">
              <div className="text-center pb-4 border-b border-border-primary space-y-3">
                <div className="h-6 w-32 bg-skeleton-bg rounded-md mx-auto" />
                <div className="h-10 w-24 bg-skeleton-bg rounded-md mx-auto" />
              </div>
              <div className="space-y-2 min-h-[80px]">
                {[...Array(3)].map((_, k) => (
                  <div key={k} className="flex gap-2 items-center">
                    <div className="w-4 h-4 bg-skeleton-bg rounded-full shrink-0" />
                    <div className="h-4 flex-1 bg-skeleton-bg rounded-md" />
                  </div>
                ))}
              </div>
              <div className="h-10 w-full bg-skeleton-bg rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanSkeleton;
