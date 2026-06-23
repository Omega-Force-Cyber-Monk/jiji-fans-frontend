import React from "react";

const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

const WaitlistTableSkeleton: React.FC = () => {
  return (
    <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 shadow-sm overflow-hidden animate-pulse">
      {/* Filter row skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="h-6 w-48 bg-primary-bg rounded-md animate-pulse" />
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="h-10 w-40 bg-primary-bg rounded-md shrink-0 animate-pulse" />
          <div className="h-10 w-60 bg-primary-bg rounded-md shrink-0 animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-primary bg-primary-bg/25">
              <th className="py-6 px-6"><div className="h-4 w-12 bg-primary-bg rounded-sm animate-pulse" /></th>
              <th className="py-6 px-6"><div className="h-4 w-32 bg-primary-bg rounded-sm animate-pulse" /></th>
              <th className="py-6 px-6"><div className="h-4 w-44 bg-primary-bg rounded-sm animate-pulse" /></th>
              <th className="py-6 px-6"><div className="h-4 w-36 bg-primary-bg rounded-sm animate-pulse" /></th>
              <th className="py-6 px-6"><div className="h-4 w-28 bg-primary-bg rounded-sm animate-pulse" /></th>
              <th className="py-6 px-6"><div className="h-4 w-24 bg-primary-bg rounded-sm animate-pulse" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/50">
            {skeletonRows.map((row) => (
              <tr key={row}>
                <td className="py-6 px-6"><div className="h-4 w-16 bg-primary-bg rounded-sm animate-pulse" /></td>
                <td className="py-6 px-6"><div className="h-4 w-24 bg-primary-bg rounded-sm animate-pulse" /></td>
                <td className="py-6 px-6"><div className="h-4 w-40 bg-primary-bg rounded-sm animate-pulse" /></td>
                <td className="py-6 px-6"><div className="h-4 w-32 bg-primary-bg rounded-sm animate-pulse" /></td>
                <td className="py-6 px-6"><div className="h-4 w-28 bg-primary-bg rounded-sm animate-pulse" /></td>
                <td className="py-6 px-6"><div className="h-4 w-20 bg-primary-bg rounded-sm animate-pulse" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitlistTableSkeleton;
