"use client";

import React from "react";
import { Breadcrumb } from "antd";
import WaitlistTableSkeleton from "@/app/admin/waitlist/components/WaitlistTableSkeleton";

const AdminWaitlistSkeleton = () => {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Breadcrumb Skeleton */}
      <Breadcrumb
        items={[
          { title: "Home", href: "/admin/home" },
          { title: "Waitlist" },
        ]}
        className="text-sm"
      />

      {/* Composed Table Skeleton */}
      <WaitlistTableSkeleton />
    </div>
  );
};

export default AdminWaitlistSkeleton;
