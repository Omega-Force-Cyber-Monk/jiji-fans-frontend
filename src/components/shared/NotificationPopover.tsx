"use client";

import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Badge, Popover, Skeleton } from "antd";
import Link from "next/link";
import { useGetAllNotificationsQuery, TNotification } from "@/redux/features/notification/notification.api";
import { compareByCTime } from "@/lib/helpers/compareByCTime";

const NotificationPopover = ({ viewAllHref = "/notifications" }: { viewAllHref?: string }) => {
  const { data, isLoading } = useGetAllNotificationsQuery();
  const notifications = data?.data?.notifications || [];

  const content = (
    <div className="w-80 sm:w-96 flex flex-col h-[500px] bg-primary-bg rounded-lg overflow-hidden shadow-2xl  transition-colors duration-300">
      <div className="px-3 py-3 border-b border-border-primary flex items-center justify-between bg-primary-bg">
        <h6 className="text-lg font-semibold text-primary-text">Notifications</h6>
        <Badge count={notifications.length} showZero color="var(--color-brand-primary)" size="small" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton.Avatar active size="small" />
                <div className="flex-1 space-y-2">
                  <Skeleton.Input active size="small" block />
                  <Skeleton.Input active size="small" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-primary-bg">
            <div className="size-12 rounded-full bg-secondary-bg flex items-center justify-center mb-3">
              <BellIcon className="size-6 text-muted-text" />
            </div>
            <p className="text-secondary-text font-medium">No new notifications</p>
            <p className="text-sm text-muted-text mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="divide-y divide-border-primary/50">
            {notifications.slice(0, 5).map((item: TNotification) => (
              <div
                key={item._id}
                className="px-4 py-3.5 hover:bg-secondary-bg transition-colors cursor-pointer group"
              >
                <div className="flex gap-3">
                  <div className="size-9 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary transition-all">
                    <BellIcon className="size-5 text-brand-primary group-hover:text-primary-bg transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-primary-text truncate">{item.title}</p>
                    <p className="text-sm text-secondary-text line-clamp-2 mt-0.5">{item.message}</p>
                    <p className="text-sm text-muted-text mt-1.5 flex items-center gap-1">
                      <span className="size-1 rounded-full bg-border-primary" />
                      {compareByCTime({ preTime: item.createdAt })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border-primary bg-secondary-bg/50">
        <Link
          href={viewAllHref}
          className="w-full py-2 flex items-center justify-center text-sm font-semibold text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg transition-all duration-200 border border-brand-primary/10 hover:border-brand-primary"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      trigger="click"
      content={content}
      overlayClassName="notification-popover"
    >
      <div className="relative size-11 flex items-center justify-center rounded-full bg-primary-bg hover:bg-brand-primary/10 transition-all active:scale-95 group shadow-sm border border-border-primary cursor-pointer">
        <Badge
          count={notifications.length}
          size="small"
          offset={[-2, 2]}
          color="var(--color-brand-secondary)"
        >
          <BellIcon className="size-6 text-brand-primary group-hover:text-primary-bg transition-colors" />
        </Badge>
      </div>
    </Popover>
  );
};

export default NotificationPopover;
