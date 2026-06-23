import { cn } from "@/utils/cn";
import React from "react";
import ThemeToggle from "./ThemeToggle";
import NotificationPopover from "./NotificationPopover";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface AdminHeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

const AdminHeader = ({ className, onMenuClick }: AdminHeaderProps) => {
  return (
    <header className={cn("w-full sticky top-0 z-40 bg-secondary-bg/95 backdrop-blur-md border-b border-border-primary transition-colors duration-300 py-3", className)}>
      <div className="w-full px-6 lg:px-6 flex justify-between items-center gap-6">
        <div className="flex items-center gap-2 md:gap-6">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-md hover:bg-primary-bg/10 transition-colors lg:hidden flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Bars3Icon className="w-6 h-6 text-primary-text" />
            </button>
          )}
          {/* Desktop welcome message */}
          <div className="block">
            <h4 className="text-base md:text-xl font-semibold text-primary-text leading-tight tracking-tight">
              Welcome to +2Fans
            </h4>
            <p className="text-xs md:text-sm font-normal text-muted-text">
              Platform Control Center
            </p>
          </div>
        </div>
        {/* Mobile Logo */}
        {/* <Link href="/" className="self-center w-30 h-14 lg:hidden relative flex-shrink-0">
          <Image
            src="/static/2Fans-01.svg"
            alt="Logo"
            fill
            style={{ objectFit: "contain" }}
            className="dark:brightness-110"
          />
        </Link> */}

        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Admin Notifications */}
          <NotificationPopover viewAllHref="/admin/notifications" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
