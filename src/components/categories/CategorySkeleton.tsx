import React from "react";

export const CategoryCardSkeleton = ({ index = 0 }: { index?: number }) => {
  return (
    <li
      className="flex items-center justify-between px-5 py-4 border-b border-border-primary last:border-b-0 animate-pulse"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar / Icon Skeleton */}
        <div className="w-10 h-10 rounded-md shrink-0 border border-border-primary bg-skeleton-bg" />
        
        {/* Name + ID Skeleton */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="h-5 w-32 bg-skeleton-bg rounded-md" />
          <div className="h-4 w-20 bg-skeleton-bg rounded-md" />
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <div className="w-16 h-7 rounded-md bg-skeleton-bg" />
        <div className="w-16 h-7 rounded-md bg-skeleton-bg" />
      </div>
    </li>
  );
};

export const CategoryListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <ul className="list-none p-0 m-0">
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} index={index} />
      ))}
    </ul>
  );
};

export default CategoryCardSkeleton;
