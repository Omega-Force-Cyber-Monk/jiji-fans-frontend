import React from "react";
import { Skeleton } from "antd";

const requestSkeletonRows = Array.from({ length: 6 }, (_, index) => index);

const KycRequestsSkeleton = () => (
  <div className="w-full rounded-md border border-border-primary bg-secondary-bg overflow-hidden animate-pulse">
    {/* Table Header Skeleton */}
    <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-4 border-b border-border-primary bg-primary-bg/50">
      <div className="text-left"><span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Request ID</span></div>
      <div className="text-center"><span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Type</span></div>
      <div className="text-left"><span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Name / Business</span></div>
      <div className="text-left"><span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Submitted</span></div>
      <div className="text-center"><span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Status</span></div>
      <div className="text-center"><span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Action</span></div>
    </div>

    {/* Table Body Rows Skeleton */}
    <div className="divide-y divide-border-primary">
      {requestSkeletonRows.map((row) => (
        <div
          key={row}
          className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-4 items-center px-6 py-4 bg-transparent hover:bg-primary-bg/10 transition-colors"
        >
          {/* Column 1: Request ID */}
          <div className="flex md:block items-center justify-between">
            <span className="md:hidden text-xs font-medium text-muted-text uppercase">Request ID:</span>
            <Skeleton.Input active size="small" className="!w-24 !h-5 !min-w-0" />
          </div>

          {/* Column 2: Type */}
          <div className="flex md:block items-center justify-center">
            <span className="md:hidden text-xs font-medium text-muted-text uppercase">Type:</span>
            <Skeleton.Input active size="small" className="!w-16 !h-6 !min-w-0 rounded-sm" />
          </div>

          {/* Column 3: Name / Business */}
          <div className="flex md:block items-center justify-between">
            <span className="md:hidden text-xs font-medium text-muted-text uppercase">Name:</span>
            <Skeleton.Input active size="small" className="!w-32 !h-5 !min-w-0" />
          </div>

          {/* Column 4: Submitted */}
          <div className="flex md:block items-center justify-between">
            <span className="md:hidden text-xs font-medium text-muted-text uppercase">Submitted:</span>
            <Skeleton.Input active size="small" className="!w-36 !h-5 !min-w-0" />
          </div>

          {/* Column 5: Status */}
          <div className="flex md:block items-center justify-center">
            <span className="md:hidden text-xs font-medium text-muted-text uppercase">Status:</span>
            <Skeleton.Input active size="small" className="!w-20 !h-6 !min-w-0 rounded-sm" />
          </div>

          {/* Column 6: Action */}
          <div className="flex md:block items-center justify-center">
            <span className="md:hidden text-xs font-medium text-muted-text uppercase">Action:</span>
            <Skeleton.Button active size="small" className="!w-28 !h-9 !min-w-0 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default KycRequestsSkeleton;
