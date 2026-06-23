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

  return (
    <header
      className={cn(
        "flex justify-start items-center p-3 lg:p-4 border-b border-border-primary bg-secondary-bg/95 backdrop-blur-md",
        className
      )}
    >
      <Link
        href="/messages"
        className="mr-2 p-1 rounded-full hover:bg-secondary-bg transition-colors"
        aria-label="Back to conversations"
      >
        <ChevronLeftIcon className="size-6 text-primary-text" />
      </Link>

      <div className="flex items-center gap-3 min-w-0">
        {isLoading ? (
          <Skeleton.Avatar active size={44} />
        ) : (
          <Avatar
            size={44}
            src={userDetails?.avatar}
            alt={userDetails?.username || "User"}
            className="border border-border-primary shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton.Input active size="small" className="!w-32 !h-4" />
          ) : (
            <h1 className="text-base font-semibold text-primary-text truncate">
              {userDetails?.username || "Unknown User"}
            </h1>
          )}
          <p className="text-sm text-emerald-600 font-medium">Online</p>
        </div>
      </div>
    </header>
  );
};

export default Participant;
