"use client";

import React from "react";
import { Button } from "antd";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

interface SliderNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * SliderNavigation - A reusable navigation control for sliders and paginated lists.
 * Adheres to the Design System for Dark Mode visibility.
 */
const SliderNavigation = ({
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  className,
  size = "md",
}: SliderNavigationProps) => {
  const sizeClasses = {
    sm: "w-6! h-6!",
    md: "w-7! h-7!",
    lg: "w-8! h-8!",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className={cn("flex justify-end gap-2.5", className)}>
      <Button
        size="small"
        shape="circle"
        onClick={onPrev}
        disabled={prevDisabled}
        className={cn(
          "flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-30 !bg-secondary-bg border border-border-primary hover:border-border-primary/50 group shadow-sm",
          sizeClasses[size]
        )}
      >
        <ChevronLeftIcon
          className={cn(
            "text-primary-text group-hover:text-brand-primary transition-colors",
            iconSizes[size]
          )}
        />
      </Button>
      <Button
        size="small"
        shape="circle"
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          "flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-30 !bg-secondary-bg border-brand-primary/20 hover:border-brand-primary/50 group shadow-sm",
          sizeClasses[size]
        )}
      >
        <ChevronRightIcon
          className={cn(
            "text-primary-text group-hover:text-brand-primary transition-colors",
            iconSizes[size]
          )}
        />
      </Button>
    </div>
  );
};

export default SliderNavigation;
