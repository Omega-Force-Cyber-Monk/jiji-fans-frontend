import React from "react";
import { Skeleton } from "antd";

const CreateChannelFormSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse p-6 bg-primary-bg rounded-lg border border-border-primary">
      {/* Top Breadcrumb Skeleton */}
      <div className="pb-6 border-b border-border-primary">
        <Skeleton.Input active size="small" className="!w-48" />
      </div>

      {/* Visual Preview Card Skeleton */}
      <div className="w-full rounded-lg border border-border-primary bg-secondary-bg overflow-hidden p-6 space-y-6">
        <div className="w-full bg-border-primary/20 rounded-md" style={{ height: "240px" }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">
          <div className="w-16 h-16 rounded-md bg-border-primary/30 border-[3px] border-primary-bg" />
          <div className="flex-1 space-y-6">
            <Skeleton.Input active size="large" className="!w-64" />
            <Skeleton.Input active size="small" className="!w-32" />
          </div>
        </div>
      </div>

      {/* Form Section Skeleton */}
      <div className="bg-primary-bg rounded-lg border border-border-primary overflow-hidden">
        <div className="px-6 py-6 border-b border-border-primary bg-secondary-bg flex items-center gap-6">
          <div className="w-8 h-8 rounded-md bg-border-primary/20" />
          <div className="space-y-6">
            <Skeleton.Input active size="small" className="!w-32" />
            <Skeleton.Input active size="small" className="!w-48" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Skeleton.Input active size="large" className="!w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton.Input active size="large" className="!w-full" />
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton.Input active size="large" className="!w-full" />
          </div>

          <div className="space-y-6">
            <Skeleton.Input active size="large" className="!w-full" style={{ height: "80px" }} />
          </div>

          <div className="space-y-6">
            <Skeleton.Input active size="large" className="!w-full" style={{ height: "120px" }} />
          </div>

          {/* Action Bar Skeleton */}
          <div className="pt-6 border-t border-border-primary flex items-center justify-end gap-6">
            <Skeleton.Button active size="large" className="!w-24" />
            <Skeleton.Button active size="large" className="!w-36" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelFormSkeleton;
