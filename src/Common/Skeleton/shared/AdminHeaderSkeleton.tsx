import React from "react";

const AdminHeaderSkeleton = () => {
  return (
    <div className="w-full sticky top-0 z-40 bg-secondary-bg/95 backdrop-blur-md border-b border-border-primary py-6 animate-pulse">
      <div className="w-full px-6 flex justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          {/* Mobile hamburger skeleton */}
          <div className="w-12 h-12 bg-primary-bg/20 rounded-md lg:hidden" />

          {/* Logo/Title skeleton */}
          <div className="space-y-6">
            <div className="h-6 w-32 bg-primary-bg/20 rounded-md" />
            <div className="h-4 w-48 bg-primary-bg/20 rounded-md hidden lg:block" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary-bg/20 rounded-md" />
          <div className="w-12 h-12 bg-primary-bg/20 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default AdminHeaderSkeleton;
