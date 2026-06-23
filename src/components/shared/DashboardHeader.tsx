"use client";

import React from "react";
import Link from "next/link";
import Image from "@/components/ui/CImage";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { Badge, Avatar } from "antd";
import { cn } from "@/utils/cn";
import { useAppSelector } from "@/redux/hook";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "@/lib/helpers/getImageUrl";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  className?: string;
  isAdmin?: boolean;
}

const DashboardHeader = ({
  onMenuClick,
  className,
  isAdmin,
}: DashboardHeaderProps) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header
      className={cn(
        "flex items-center justify-between px-4  pt-[env(safe-area-inset-top)] bg-brand-primary border-b border-brand-secondary lg:hidden sticky top-0 z-50 w-full transition-colors duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-md hover:bg-primary-bg/10 transition-colors"
          aria-label="Open navigation menu"
        >
          <Bars3Icon className="size-6 text-white" />
        </button>
        <Link href="/" className="relative w-24 h-8 brightness-0 invert">
          <Image
            src="/static/2Fans-01.svg"
            alt="Logo"
            fill
            style={{ objectFit: "contain" }}
          />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin ? (
          <Link href="/admin/notifications">
            <Badge count={0} size="small" offset={[-2, 2]}>
              <div className="p-1.5 rounded-full bg-primary-bg/20 text-white hover:bg-primary-bg/30 transition-colors">
                <BellIcon className="size-5" />
              </div>
            </Badge>
          </Link>
        ) : (
          <Link href="/notifications">
            <Badge count={0} size="small" offset={[-2, 2]}>
              <div className="p-1.5 rounded-full bg-primary-bg/20 text-white hover:bg-primary-bg/30 transition-colors">
                <BellIcon className="size-5" />
              </div>
            </Badge>
          </Link>
        )}

        <Link href={isAdmin ? "/admin/settings" : "/profile"}>
          <Avatar
            src={getImageUrl(user?.avatar)}
            size="small"
            icon={!user?.avatar && <UserCircleIcon className="size-4" />}
            className="border border-primary-bg/50"
          />
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader;
