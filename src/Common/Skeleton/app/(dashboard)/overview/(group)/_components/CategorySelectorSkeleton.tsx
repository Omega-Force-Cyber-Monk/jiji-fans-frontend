import React from "react";

const CategorySelectorSkeleton = () => {
  return (
    <div className="flex w-full items-center gap-4 overflow-x-hidden py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-24 shrink-0 rounded-md bg-skeleton-bg animate-pulse"
        />
      ))}
    </div>
  );
};

export default CategorySelectorSkeleton;
