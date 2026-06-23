"use client";

import ClientButtton from "@/components/ui/ClientButtton";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Image from "@/components/ui/CImage";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useGetChannelsByCategoryQuery } from "@/redux/features/channel/channel.api";
import type { TChannel } from "@/redux/features/channel/channel.api";
import { Skeleton } from "antd";

const Page = () => {
  const params = useParams();
  const categoryId = params?.slug as string;

  const [allChannels, setAllChannels] = useState<TChannel[]>([]);
  const [category, setCategory] = useState<{ categoryName: string } | null>(
    null,
  );
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadedCursorsRef = useRef<Set<string>>(new Set());

  const { data, isLoading, isFetching } = useGetChannelsByCategoryQuery(
    {
      category: categoryId,
      channelLimit: 3, // Adjust as needed
      channelCursor: cursor,
    },
    { skip: !categoryId || (!hasMore && cursor !== undefined) },
  );

  useEffect(() => {
    if (data?.data?.categories?.[0]) {
      const categoryData = data.data.categories[0];

      // Set category info
      setCategory({ categoryName: categoryData.categoryName });

      if (cursor === undefined) {
        // Initial load
        setAllChannels(categoryData.channels);
        loadedCursorsRef.current.clear();
        loadedCursorsRef.current.add("initial");
      } else {
        const currentCursor = cursor;

        // Only append if we haven't loaded this cursor yet
        if (!loadedCursorsRef.current.has(currentCursor)) {
          loadedCursorsRef.current.add(currentCursor);

          // Append new channels, avoid duplicates by checking _id
          setAllChannels((prev) => {
            const existingIds = new Set(prev.map((ch) => ch._id));
            const newChannels = categoryData.channels.filter(
              (ch) => !existingIds.has(ch._id),
            );
            console.log(
              `Merging ${newChannels.length} new channels. Total will be: ${prev.length + newChannels.length}`,
            );
            return [...prev, ...newChannels];
          });
        } else {
          console.log(`Skipping duplicate cursor: ${currentCursor}`);
        }
      }

      // Always update pagination state
      setHasMore(categoryData.channelPagination.hasNextPage);
    }
  }, [data, cursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          hasMore &&
          !isFetching &&
          data?.data?.categories?.[0]?.channelPagination?.nextCursor
        ) {
          const nextCursor =
            data.data.categories[0].channelPagination.nextCursor;
          // Only set cursor if it's different from the current one
          if (nextCursor !== cursor) {
            setCursor(nextCursor);
          }
        }
      },
      { threshold: 0.1 },
    );

    const currentObserver = observerRef.current;

    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasMore, isFetching, data, cursor]);

  const categorySkeleton = (
    <div className="w-full">
      <div className="flex justify-start items-center gap-3 mb-8">
        <Skeleton.Avatar active size="large" shape="circle" />
        <Skeleton.Input active style={{ width: 260, height: 28 }} />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="channel-card group mb-6 xl:mb-8">
            <div className="relative overflow-hidden rounded-2xl aspect-[4/2] bg-secondary-bg shadow-lg p-4">
              <div className="absolute inset-0 p-4 md:p-6 xl:p-8 flex items-end">
                <div className="flex gap-4 sm:gap-6 w-full items-center">
                  <Skeleton.Avatar active size={80} shape="circle" />
                  <div className="flex-1 space-y-3">
                    <Skeleton.Input
                      active
                      style={{ width: "45%", height: 22 }}
                    />
                    <Skeleton.Input
                      active
                      style={{ width: "85%", height: 18 }}
                    />
                    <Skeleton.Input
                      active
                      style={{ width: "70%", height: 18 }}
                    />
                  </div>
                  <Skeleton.Button active shape="circle" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading && allChannels.length === 0) {
    return categorySkeleton;
  }

  console.log("Category data", data);

  console.log("Displaying channels", allChannels.length, allChannels);

  return (
    <div className="w-full">
      {/* Header with back button and category name */}
      <div className="flex justify-start items-center gap-3 mb-8">
        <ClientButtton
          type="push"
          path="/overview"
          className="w-10 h-10 rounded-full bg-secondary-bg hover:bg-brand-primary/10 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group border border-border-primary"
        >
          <ChevronLeftIcon className="w-5 text-primary-text group-hover:text-brand-primary transition-colors" />
        </ClientButtton>
        <div className="relative">
          <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-primary-text">
            {category?.categoryName || "Category"}
          </h1>
          <div className="absolute -bottom-1 left-0 h-1 w-20 bg-brand-primary rounded-full" />
        </div>
      </div>

      <div className="mt-8">
        {allChannels.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full bg-brand-primary/10 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-primary-bg flex items-center justify-center border border-border-primary">
                <svg
                  className="w-14 h-14 text-muted-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-primary-text mb-3">
              No Channels Available
            </h3>
            <p className="text-secondary-text max-w-md mb-8 text-lg">
              There are currently no channels in this category. Check back later
              for new content!
            </p>
            <ClientButtton type="push" path="/overview">
              <div className="px-8 py-3.5 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform">
                Browse Other Categories
              </div>
            </ClientButtton>
          </div>
        ) : (
          <>
            {allChannels.map((channel) => (
              <div
                key={channel._id}
                className="channel-card group mb-6 xl:mb-8"
              >
                <Link href={`/overview/channels/${channel._id}`}>
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/2] bg-secondary-bg shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-border-primary">
                    <Image
                      src={channel.avatar}
                      alt={channel.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/90 transition-all duration-500 group-hover:via-black/40" />

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 p-4 md:p-6 xl:p-8 flex items-end">
                      <div className="flex gap-4 sm:gap-6 w-full items-center">
                        {/* Avatar */}
                        <div className="relative h-14 md:h-20 2xl:h-24 w-14 md:w-20 2xl:w-24 shrink-0 rounded-full overflow-hidden border-3 border-white/30 shadow-2xl ring-2 ring-white/20 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                          <Image
                            src={channel.avatar}
                            alt={channel.name}
                            height={500}
                            width={500}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Channel info */}
                        <div className="flex-1 space-y-1 2xl:space-y-2 transform transition-transform duration-500 group-hover:translate-x-2">
                          <h5 className="text-lg xl:text-xl 2xl:text-3xl font-bold text-white drop-shadow-2xl">
                            {channel.name}
                          </h5>
                          <p className="text-sm xl:text-base 2xl:text-lg leading-relaxed line-clamp-2 text-white/90 drop-shadow-lg">
                            {channel.description || "No description available"}
                          </p>
                        </div>

                        {/* Arrow indicator */}
                        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transform transition-all duration-500 group-hover:bg-green-500 group-hover:translate-x-2 group-hover:scale-110">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Intersection Observer Target */}
      <div ref={observerRef} className="w-full py-4">
        {isFetching && hasMore && (
          <div className="flex justify-center">
            <Skeleton.Button active shape="round" style={{ width: 180 }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
