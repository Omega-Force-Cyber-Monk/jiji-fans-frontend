"use client";

import React, { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon, BanknotesIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { PlusIcon } from "@heroicons/react/16/solid";
import NotificationPopover from "./NotificationPopover";
import ThemeToggle from "./ThemeToggle";
import { useGetMyChannelQuery } from "@/redux/features/channel/channel.api";
import { useGetWalletStatsQuery } from "@/redux/features/wallet/wallet.api";
import { useGetProfileQuery } from "@/redux/features/users/users.api";

interface DesktopHeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

const DesktopHeader = ({ className, onMenuClick }: DesktopHeaderProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [showEarnings, setShowEarnings] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const toggleEarnings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showEarnings) {
      setShowEarnings(false);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    } else {
      setShowEarnings(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setShowEarnings(false);
      }, 3000);
    }
  };

  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const isCreator = user?.role?.toLowerCase() === "creator";
  const { data: channelData, isLoading } = useGetMyChannelQuery(undefined, {
    skip: !isCreator,
  });

  const { data: walletData, isLoading: isWalletLoading } = useGetWalletStatsQuery(undefined, {
    skip: !isCreator,
  });

  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    skip: !isCreator,
  });

  const hasChannel = !!channelData?.data?._id;
  const balance = walletData?.availableBalance ?? walletData?.balance ?? 0;

  const isKycCompleted = profileData?.data?.kycStatus === "APPROVED";

  const isHeaderLoading = isWalletLoading || isProfileLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/overview?search=${encodeURIComponent(searchValue.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "w-full sticky top-0 z-40 bg-secondary-bg/95 backdrop-blur-md border-b border-border-primary py-3 transition-colors duration-300",
        className
      )}
    >
      <div className="w-full px-4 lg:px-6 flex items-center justify-between gap-4 md:gap-6 relative">
        {/* Left: Mobile Menu Trigger & Search Bar */}
        <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-primary-bg/10 transition-colors lg:hidden flex items-center justify-center shrink-0"
              aria-label="Open navigation menu"
            >
              <Bars3Icon className="w-6 h-6 text-primary-text" />
            </button>
          )}

          {/* Pill-shaped Search Bar (Desktop Only) */}
          <form onSubmit={handleSearch} className="hidden md:block relative w-full max-w-xl group">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search channel....."
              className="w-full pl-5 pr-12 py-2 bg-primary-bg border border-border-primary rounded-full text-primary-text placeholder:text-muted-text focus:outline-none transition-all text-sm md:text-base"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full flex items-center pr-3 overflow-hidden group/btn"
              aria-label="Search"
            >
              <div className="h-1/2 w-px bg-border-primary mr-3" />
              <MagnifyingGlassIcon className="size-4 md:size-5 text-brand-primary group-hover/btn:scale-110 transition-transform" />
            </button>
          </form>
        </div>

        {/* Right: Actions (Search, Create, Earnings, Theme, Notifications) */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Mobile Search Toggle Icon */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden size-9 md:size-11 flex items-center justify-center rounded-full bg-primary-bg border border-border-primary hover:bg-brand-primary/10 text-primary-text hover:text-brand-primary transition-all shadow-sm"
            aria-label="Toggle mobile search"
          >
            <MagnifyingGlassIcon className="size-4 md:size-5" />
          </button>

          {/* Create Button */}
          {user?.role?.toLowerCase() !== "admin" && (
            isCreator && isLoading ? (
              <div className="h-9 w-9 md:h-[46px] md:w-[140px] bg-border-primary/20 rounded-full animate-pulse" />
            ) : (
              <Link
                href={
                  isCreator
                    ? hasChannel
                      ? `/upload-content`
                      : `/mychannel`
                    : `/mychannel`
                }
                className="block shrink-0"
              >
                <button className="h-9 px-3 md:h-[46px] md:px-6 flex items-center justify-center gap-2 font-semibold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 active:scale-[0.98] cursor-pointer group">
                  <PlusIcon className="size-4 md:size-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-xs md:text-sm uppercase tracking-wide hidden md:inline">
                    {isCreator
                      ? hasChannel
                        ? `Create`
                        : `Create Channel`
                      : `Become a creator`}
                  </span>
                </button>
              </Link>
            )
          )}

          {/* Creator Earnings Button */}
          {isCreator && (
            isHeaderLoading ? (
              <div className="h-9 w-9 md:h-[46px] md:w-[160px] bg-border-primary/20 rounded-full animate-pulse" />
            ) : (
              <Link href={isKycCompleted ? "/wallet" : "/verification"} className="block shrink-0">
                <div className="relative group cursor-pointer">
                  {/* The actual button */}
                  <button className={cn(
                    "h-9 px-3 md:h-[46px] md:px-5 flex items-center justify-center gap-2 font-semibold text-primary-text bg-primary-bg border border-border-primary dark:border-brand-primary rounded-full hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 active:scale-[0.98]",
                    !isKycCompleted && "opacity-50 blur-[0.5px]"
                  )}>
                    <BanknotesIcon className="size-4 md:size-5 text-success group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xs md:text-sm tracking-wide hidden md:flex items-center gap-1.5">
                      <span>
                        {showEarnings ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
                      </span>
                      {isKycCompleted && (
                        <span
                          onClick={toggleEarnings}
                          className="p-1 hover:bg-secondary-bg/85 rounded-full cursor-pointer ml-1 text-muted-text hover:text-primary-text transition-colors flex items-center justify-center"
                          title={showEarnings ? "Click to hide" : "Click to view (auto-hides)"}
                        >
                          {showEarnings ? (
                            <EyeSlashIcon className="size-4" />
                          ) : (
                            <EyeIcon className="size-4" />
                          )}
                        </span>
                      )}
                    </span>
                  </button>

                  {/* KYC Locked Overlay */}
                  {!isKycCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-[1px] border border-error/30 rounded-full hover:bg-black/70 hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-center gap-1 px-2 py-0.5 md:gap-1.5 md:px-3 md:py-1 font-semibold text-[10px] md:text-sm text-error">
                        <LockClosedIcon className="size-3.5 md:size-4 animate-pulse" />
                        <span className="hidden md:inline">Unverified</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Popover */}
          <NotificationPopover />
        </div>
      </div>

      {/* Floating Mobile Search Modal/Popover */}
      {isMobileSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-secondary-bg/80 backdrop-blur-md border-b border-border-primary shadow-xl lg:hidden z-50 p-4 transition-all duration-300">
          <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search channel....."
              className="w-full pl-5 pr-12 py-3 bg-primary-bg border border-brand-primary/50 rounded-xl text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-base shadow-inner"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full flex items-center pr-4"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="size-5 text-brand-primary hover:scale-110 transition-transform" />
            </button>
          </form>

          {/* Suggestion Popover Area */}
          {searchValue && (
            <div className="w-full max-w-xl mx-auto mt-3 p-3 bg-primary-bg border border-border-primary rounded-lg shadow-sm animate-in fade-in slide-in-from-top-1">
              <button
                onClick={handleSearch}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary-bg transition-colors text-left"
              >
                <div className="size-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <MagnifyingGlassIcon className="size-4 text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-text truncate">
                    Search for "{searchValue}"
                  </p>
                  <p className="text-xs text-muted-text">Press Enter to search</p>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default DesktopHeader;
