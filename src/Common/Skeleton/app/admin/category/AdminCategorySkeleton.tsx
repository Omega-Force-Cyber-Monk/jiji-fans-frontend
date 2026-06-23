"use client";

import React from "react";
import { Breadcrumb } from "antd";
import { CategoryListSkeleton } from "@/components/categories/CategorySkeleton";

const AdminCategorySkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <Breadcrumb
        items={[{ title: "Admin", href: "/admin/home" }, { title: "Categories" }]}
        className="text-sm"
      />

      {/* Page Header Row Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-sm h-10 bg-skeleton-bg rounded-md" />
        {/* Add button */}
        <div className="h-10 w-36 bg-skeleton-bg rounded-md shrink-0" />
      </div>

      {/* Category List Skeleton */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
        <CategoryListSkeleton count={8} />
      </div>
    </div>
  );
};

export default AdminCategorySkeleton;
