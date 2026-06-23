import React from "react";
import Container from "@/components/Container";
import { cn } from "@/utils/cn";

export default function HeroSectionSkeleton() {
  return (
    <section className="relative bg-[#05101b]">
      <Container
        className={cn(
          "relative w-full min-h-175 h-[calc(100vh-80px)] lg:h-screen max-h-270 flex flex-col justify-center overflow-hidden text-center sm:text-left",
        )}
        mClassName=""
      >
        {/* Floating Elements Skeletons (Hidden on mobile) */}
        <div className="absolute top-[20%] left-[5%] xl:left-[15%] w-56 h-56 hidden md:block bg-skeleton-bg rounded-lg animate-pulse" />
        <div className="absolute top-[15%] right-[15%] xl:right-[25%] w-24 h-10 hidden md:block bg-skeleton-bg rounded-md animate-pulse" />
        <div className="absolute top-[45%] right-[5%] xl:right-[15%] w-64 h-40 hidden lg:block bg-skeleton-bg rounded-lg animate-pulse" />
        <div className="absolute bottom-[20%] left-[15%] xl:left-[25%] w-20 h-10 hidden md:block bg-skeleton-bg rounded-md animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] xl:right-[25%] w-64 h-40 hidden lg:block bg-skeleton-bg rounded-lg animate-pulse" />

        {/* Centered Text Content */}
        <div className="space-y-6 sm:space-y-8 xl:space-y-12 flex flex-col justify-evenly max-w-full sm:max-w-10/12 lg:max-w-8/12 mx-auto relative z-10 pt-8 items-center">
          {/* Animated Title Skeleton */}
          <div className="w-3/4 h-12 sm:h-16 md:h-20 bg-skeleton-bg rounded-md animate-pulse" />
          
          {/* Animated Description Skeleton */}
          <div className="w-2/3 h-4 bg-skeleton-bg rounded-sm animate-pulse" />
          <div className="w-1/2 h-4 bg-skeleton-bg rounded-sm animate-pulse" />

          {/* Button Skeleton */}
          <div className="w-48 h-12 bg-skeleton-bg rounded-full animate-pulse mt-4" />
        </div>
      </Container>
    </section>
  );
}
