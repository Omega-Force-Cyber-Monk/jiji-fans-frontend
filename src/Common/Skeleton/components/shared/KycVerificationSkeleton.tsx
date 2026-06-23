import React from "react";

const KycVerificationSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-skeleton-bg rounded-md" />
        <div className="h-4 w-96 bg-skeleton-bg rounded-sm" />
      </div>
      <div className="w-full rounded-lg border border-border-primary bg-secondary-bg flex items-center justify-center" style={{ minHeight: "600px" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-skeleton-bg" />
          <div className="h-4 w-48 bg-skeleton-bg rounded-sm" />
        </div>
      </div>
    </div>
  );
};

export default KycVerificationSkeleton;
