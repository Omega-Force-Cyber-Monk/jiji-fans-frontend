import React from "react";
import SidebarSkeleton from "../../shared/SidebarSkeleton";
import DesktopHeaderSkeleton from "../../shared/DesktopHeaderSkeleton";

const LayoutSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-secondary-bg">
      {/* Desktop Sidebar Skeleton */}
      {/* <div className="hidden lg:block sticky top-0 h-screen w-56 xl:w-64 flex-shrink-0">
        <SidebarSkeleton />
      </div> */}

      {/* Gutter */}
      <div className="hidden lg:block w-6 xl:w-8 flex-shrink-0" />

      {/* Main Content Skeleton */}
      <main className="flex-1 w-full min-w-0 pt-2 lg:pt-0 pb-4 px-4 sm:px-6 lg:px-2 xl:px-4">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col">
          <DesktopHeaderSkeleton />
          <div className="flex-1 mt-4">
            <div className="w-full h-[600px] bg-white rounded-lg shadow-sm animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LayoutSkeleton;
