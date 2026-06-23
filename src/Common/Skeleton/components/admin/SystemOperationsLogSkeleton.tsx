import React from "react";

const skeletonRows = Array.from({ length: 4 }, (_, index) => index);

const SystemOperationsLogSkeleton: React.FC = () => {
  return (
    <div className="bg-secondary-bg border border-border-primary rounded-lg p-5 shadow-sm overflow-hidden animate-pulse">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-primary-bg rounded-md" />
          <div className="h-4 w-72 bg-primary-bg rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-24 bg-primary-bg rounded-md" />
          <div className="h-9 w-24 bg-primary-bg rounded-md" />
        </div>
      </div>

      {/* Responsive Table Skeleton */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-primary bg-primary-bg/25">
              <th className="py-3 px-4"><div className="h-4 w-12 bg-primary-bg rounded-sm" /></th>
              <th className="py-3 px-4"><div className="h-4 w-24 bg-primary-bg rounded-sm" /></th>
              <th className="py-3 px-4"><div className="h-4 w-20 bg-primary-bg rounded-sm" /></th>
              <th className="py-3 px-4"><div className="h-4 w-16 bg-primary-bg rounded-sm" /></th>
              <th className="py-3 px-4"><div className="h-4 w-16 bg-primary-bg rounded-sm" /></th>
              <th className="py-3 px-4"><div className="h-4 w-20 bg-primary-bg rounded-sm" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/50">
            {skeletonRows.map((row) => (
              <tr key={row}>
                <td className="py-4 px-4"><div className="h-4 w-16 bg-primary-bg rounded-sm" /></td>
                <td className="py-4 px-4"><div className="h-4 w-32 bg-primary-bg rounded-sm" /></td>
                <td className="py-4 px-4"><div className="h-4 w-28 bg-primary-bg rounded-sm" /></td>
                <td className="py-4 px-4"><div className="h-4 w-16 bg-primary-bg rounded-sm" /></td>
                <td className="py-4 px-4"><div className="h-4 w-24 bg-primary-bg rounded-sm" /></td>
                <td className="py-4 px-4"><div className="h-6 w-24 bg-primary-bg rounded-sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemOperationsLogSkeleton;
