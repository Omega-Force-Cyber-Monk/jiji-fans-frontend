"use client";

import React from "react";
import { Breadcrumb, Skeleton } from "antd";

const AdminSettingsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: "Admin", href: "/admin/home" },
          { title: "Settings" },
        ]}
        className="text-sm"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
        {/* ── Left Column Skeleton ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Card Skeleton */}
          <div className="bg-secondary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-border-primary flex items-center justify-between">
              <div className="h-5 w-32 bg-skeleton-bg rounded-md" />
              <div className="h-4 w-10 bg-skeleton-bg rounded-md" />
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center py-8 px-6 border-b border-border-primary bg-brand-primary/5">
              <Skeleton.Avatar active size={112} shape="circle" />
              <div className="mt-3 space-y-2 flex flex-col items-center">
                <div className="h-5 w-28 bg-skeleton-bg rounded-md" />
                <div className="h-4 w-40 bg-skeleton-bg rounded-md" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-skeleton-bg rounded-md" />
                <div className="h-10 w-full bg-skeleton-bg rounded-md" />
              </div>
            </div>
          </div>

          {/* Account Security Card Skeleton */}
          <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-primary">
              <div className="h-5 w-40 bg-skeleton-bg rounded-md" />
            </div>
            <div className="p-6 space-y-3">
              <div className="h-4 w-56 bg-skeleton-bg rounded-md" />
              <div className="h-12 w-full bg-skeleton-bg rounded-md" />
            </div>
          </div>
        </div>

        {/* ── Right Column Skeleton ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-border-primary space-y-2">
              <div className="h-5 w-44 bg-skeleton-bg rounded-md" />
              <div className="h-4 w-64 bg-skeleton-bg rounded-md" />
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-md border border-border-primary bg-primary-bg"
                >
                  <div className="w-10 h-10 bg-skeleton-bg rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 bg-skeleton-bg rounded-md" />
                    <div className="h-3 w-48 bg-skeleton-bg rounded-md" />
                  </div>
                  <div className="h-4 w-4 bg-skeleton-bg rounded-md shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsSkeleton;
