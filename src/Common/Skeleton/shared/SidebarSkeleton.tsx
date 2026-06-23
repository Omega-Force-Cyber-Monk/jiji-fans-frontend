import React from "react";
import { cn } from "@/utils/cn";

const SidebarSkeleton = ({
  className,
  isOpen,
}: {
  className?: string;
  isOpen?: boolean;
}) => {
  return (
    <aside className={cn(
      "py-3 h-full flex flex-col bg-secondary-bg border-r border-border-primary relative z-50",
      isOpen !== undefined
        ? cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )
        : "",
      className,
      isOpen !== undefined ? "w-[280px]" : "w-[280px]"
    )}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top: Sticky Logo */}
        <div className="pb-6 shrink-0 flex items-center justify-center">
          <div className="w-full max-w-44 aspect-[5/2] bg-skeleton-bg rounded-md" />
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 space-y-8 pb-4">
          <nav className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full px-4 py-3 flex items-center gap-4 rounded-lg"
              >
                <div className="p-1.5 rounded-md bg-skeleton-bg size-8 shrink-0" />
                <div className="h-5 w-24 bg-skeleton-bg rounded-md" />
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom: User Profile & Logout */}
        <div className="mt-auto px-4 py-4 border-t border-border-primary bg-primary-bg/50 shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary-bg border border-border-primary shadow-sm">
            <div className="h-11 w-11 rounded-full bg-skeleton-bg shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-20 bg-skeleton-bg rounded-md" />
              <div className="h-3 w-12 bg-skeleton-bg rounded-md" />
            </div>
            <div className="p-2 size-9 bg-skeleton-bg rounded-lg shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
