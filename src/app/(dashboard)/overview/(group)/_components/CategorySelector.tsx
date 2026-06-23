"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { TCategory } from "@/redux/features/category/category.api";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface CategorySelectorProps {
  categories: TCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelector = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // Check if we are scrolled to the beginning or end to disable/enable Chevrons
  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeft(scrollLeft > 4);
    // 8px tolerance to handle fractional zooms and rounding in browsers
    setShowRight(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  // Imperatively bind wheel event with passive: false to allow vertical-to-horizontal scrolling conversion
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollWidth, clientWidth } = container;
      if (scrollWidth <= clientWidth) return;

      // Prevent page from scrolling vertically while mouse wheel is over the category bar
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [categories]);

  // Handle smooth client-side slide scrolling
  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 350; // Scroll distance in pixels
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Double check scroll bounds after scroll animation completes
      setTimeout(checkScroll, 400);
    }
  };

  return (
    <div className="w-full flex items-center border-b bg-primary-bg border-border-primary/20 h-14 pb-2 relative overflow-hidden select-none sticky lg:top-[71px] z-30 ">
      {/* Browser-Proof Scrollbar-Hider Injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* Left Column: Fixed "ALL" Tab */}
      <div className="flex items-center shrink-0 pr-6 border-r border-border-primary/20 h-full">
        <button
          onClick={() => onSelectCategory("all")}
          className={cn(
            "shrink-0 whitespace-nowrap text-xs font-semibold tracking-widest uppercase h-full flex items-center border-b-[3px] transition-all duration-200 cursor-pointer pt-1",
            selectedCategoryId === "all"
              ? "text-brand-primary border-brand-primary font-bold"
              : "text-secondary-text border-transparent hover:text-primary-text"
          )}
        >
          All
        </button>
      </div>

      {/* Middle Column: Scrollable Categories list */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex-1 flex items-center gap-8 h-full overflow-x-auto no-scrollbar scroll-smooth px-6"
      >
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onSelectCategory(category._id)}
            className={cn(
              "shrink-0 whitespace-nowrap text-xs font-semibold tracking-widest uppercase h-full flex items-center border-b-[3px] transition-all duration-200 cursor-pointer pt-1",
              selectedCategoryId === category._id
                ? "text-brand-primary border-brand-primary font-bold"
                : "text-secondary-text border-transparent hover:text-primary-text"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Right Column: Fixed Pagination Chevrons */}
      <div className="flex items-center gap-4 xl:gap-6 shrink-0 pl-4 xl:pl-6 border-l border-border-primary/20 h-full">
        <button
          onClick={() => handleScroll("left")}
          disabled={!showLeft}
          className="flex items-center justify-center size-6 xl:size-8 rounded-lg bg-secondary-bg border border-border-primary text-brand-primary disabled:opacity-30 disabled:text-secondary-text transition-all cursor-pointer hover:bg-secondary-bg/85"
          aria-label="Scroll left categories"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleScroll("right")}
          disabled={!showRight}
          className="flex items-center justify-center size-6 xl:size-8 rounded-lg bg-secondary-bg border border-border-primary text-brand-primary disabled:opacity-30 disabled:text-secondary-text transition-all cursor-pointer hover:bg-secondary-bg/85"
          aria-label="Scroll right categories"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;
