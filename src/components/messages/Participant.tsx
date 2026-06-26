"use client";

import React from "react";
import Link from "next/link";
import { Avatar, Skeleton } from "antd";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { TUniObject } from "@/types";
import { cn } from "@/utils/cn";
import { useGetPublicUserByIdQuery } from "@/redux/features/users/users.api";

const Participant = ({
  data,
  className,
}: {
  data: TUniObject;
  className?: string;
}) => {
  const receiverId = typeof data?.receiver === "string" ? data.receiver : "";
  const { data: userDetails, isLoading } = useGetPublicUserByIdQuery(receiverId, {
    skip: !receiverId,
  });

  console.log("Participant User Details Debug:", { receiverId, userDetails, isLoading });

  const details = userDetails as any;
  const isCreator = details?.role?.toLowerCase?.() === "creator" || !!details?.channel;
  const displayName =
    (isCreator
      ? details?.channel?.name || details?.username || details?.name
      : details?.username || details?.name) ||
    details?.username ||
    details?.name ||
    details?.email ||
    "Unknown User";

  const displayAvatar =
    (isCreator ? details?.channel?.avatar : details?.avatar) ||
    details?.avatar ||
    "/static/demo-image.jpg";

  return (
    <header
      className={cn(
        "flex justify-start items-center p-3 lg:p-4 border-b border-border-primary/50 bg-secondary-bg/50 backdrop-blur-lg sticky top-0 z-20",
        className
      )}
    >
      <Link
        href="/messages"
        className="mr-2 p-1.5 rounded-full hover:bg-secondary-bg transition-all duration-200 hover:scale-105 active:scale-95 text-primary-text"
        aria-label="Back to conversations"
      >
        <ChevronLeftIcon className="size-5" />
      </Link>

      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0 flex items-center">
          {isLoading ? (
            <Skeleton.Avatar active size={42} />
          ) : (
            <>
              <Avatar
                size={42}
                src={displayAvatar}
                alt={displayName}
                className="border border-border-primary/40 shrink-0 object-cover"
              />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-secondary-bg/80 animate-pulse-slow" />
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton.Input active size="small" className="!w-28 !h-4" />
          ) : (
            <h1 className="text-base font-semibold text-primary-text truncate tracking-wide">
              {displayName}
            </h1>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-xs text-emerald-500 font-medium tracking-wide">Online</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Participant;
