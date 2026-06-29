"use client";
import React, { createElement, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TRole } from "@/types";
import { generateLink } from "@/lib/generateLink";
import { cn } from "@/utils/cn";
import Swal from "sweetalert2";
import { logout } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getRoleLabel } from "@/lib/helpers/getRoleLabel";
import { dashboardItems } from "@/constants/router.const";
import Link from "next/link";
import Image from "@/components/ui/CImage";
import { PowerIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import RecentVisit from "../dashboard/RecentVisit";
import SidebarSkeleton from "@/Common/Skeleton/shared/SidebarSkeleton";
import { Tooltip } from "antd";

const Sidebar = ({
  className,
  isAdmin,
  onClose,
  showBrand = true,
  isOpen,
}: {
  className?: string;
  isAdmin?: boolean;
  onClose?: () => void;
  showBrand?: boolean;
  isOpen?: boolean;
}) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSnapshot, setLogoutSnapshot] = useState<any | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) { // xl breakpoint is 1280px
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogOut = () => {
    Swal.fire({
      html: `
        <div class="flex flex-col items-center gap-2 pt-2 pb-2">
            <div class="h-16 w-16 rounded-full bg-error/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-error">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-primary-text m-0">Sign Out</h3>
            <p class="text-secondary-text text-sm m-0 mt-1">Are you sure you want to sign out of your account?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sign out",
      cancelButtonText: "Cancel",
      showConfirmButton: true,
      reverseButtons: true,
      buttonsStyling: false,
      background: "var(--primary-bg)",
      color: "var(--primary-text)",
      customClass: {
        popup: "rounded-xl border border-border-primary shadow-xl",
        htmlContainer: "m-0 p-0",
        actions: "w-full flex flex-col-reverse sm:flex-row justify-center gap-3 px-6 pb-6 pt-2 mt-4",
        confirmButton: "w-full sm:w-auto px-8 py-2.5 bg-error text-white font-medium rounded-md hover:bg-error/90 transition-colors shadow-sm",
        cancelButton: "w-full sm:w-auto px-8 py-2.5 bg-secondary-bg border border-border-primary text-secondary-text font-medium rounded-md hover:bg-border-primary/50 transition-colors",
      },
    }).then((res) => {
      if (res.isConfirmed) {
        setLogoutSnapshot(user);
        setIsLoggingOut(true);
        dispatch(logout());
        window.location.href = "/";
        if (onClose) onClose();
      }
    });
  };

  const visibleUser = isLoggingOut ? logoutSnapshot : user;

  if (!user && !isLoggingOut) {
    return <SidebarSkeleton className={className} isOpen={isOpen} />;
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary-bg/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "py-3 h-full flex flex-col bg-secondary-bg border-r border-border-primary transition-all duration-300 relative z-50",
        isOpen !== undefined
          ? cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )
          : "",
        className,
        isOpen !== undefined ? "w-[280px]" : (isCollapsed ? "w-[80px]" : "w-[280px]")
      )}>

        {/* Collapse Toggle Button */}
        {isOpen === undefined && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-14 bg-primary-bg border border-border-primary rounded-full p-1.5 text-secondary-text hover:text-brand-primary hover:border-brand-primary transition-all z-50 shadow-sm flex items-center justify-center"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Header Row for Logo and Close Buttons */}
          <div className={cn(
            "pb-8 shrink-0 flex items-center justify-between px-4",
            isCollapsed && isOpen === undefined ? "flex-col gap-4" : "flex-row"
          )}>
            {showBrand && (
              <>
                {/* Small Logo */}
                <div className={cn("relative w-10 h-10 transition-all duration-300", isOpen === undefined && isCollapsed ? "block" : "hidden")}>
                  <Link href={`/`} onClick={() => onClose && onClose()}>
                    <Image
                      src="/static/2Fans-02.svg"
                      alt="Logo"
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="100vw"
                      className="drop-shadow-sm dark:brightness-110"
                    />
                  </Link>
                </div>
                {/* Large Logo */}
                <div className={cn("relative w-full max-w-44 aspect-[5/2] transition-all duration-300", isOpen !== undefined || !isCollapsed ? "block" : "hidden")}>
                  <Link href={`/`} onClick={() => onClose && onClose()}>
                    <Image
                      src="/static/2Fans-01.svg"
                      alt="Logo"
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="100vw"
                      className="drop-shadow-sm dark:brightness-110"
                    />
                  </Link>
                </div>
              </>
            )}

            {/* Close Button (Mobile) */}
            {isOpen !== undefined && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-secondary-text hover:text-brand-primary hover:bg-primary-bg transition-colors ml-auto"
                aria-label="Close Sidebar"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Scrollable Navigation */}
          <div className={cn("flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-4", isOpen !== undefined || !isCollapsed ? "px-4" : "px-2")}>
            <nav className="space-y-1.5" aria-label="Dashboard Navigation">
              {visibleUser &&
                generateLink(dashboardItems, visibleUser.role as TRole).map(
                  ({ name, icon, path }, indx) => {
                    const itemPath = path as string;
                    const normalizedPath = itemPath.startsWith("/") ? itemPath : `/${itemPath}`;
                    const isActive = pathname === normalizedPath ||
                      (normalizedPath === "/verification"
                        ? pathname === "/verification"
                        : pathname.startsWith(normalizedPath + "/"));

                    const linkContent = (
                      <Link
                        href={normalizedPath}
                        onClick={() => onClose && onClose()}
                        className={cn(
                          "w-full py-3 flex items-center text-base font-medium rounded-lg transition-all duration-200 group overflow-hidden",
                          isOpen !== undefined || !isCollapsed ? "px-4 justify-start gap-4" : "px-0 justify-center",
                          {
                            "bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02]": isActive,
                            "text-secondary-text hover:bg-primary-bg hover:text-brand-primary": !isActive,
                          }
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md transition-colors shrink-0",
                          isActive ? "bg-white/20" : "bg-transparent group-hover:bg-brand-primary/10"
                        )}>
                          {createElement(icon, {
                            className: cn("size-5", isActive ? "text-white" : "text-muted-text group-hover:text-brand-primary"),
                          })}
                        </div>
                        <span className={cn("truncate whitespace-nowrap", isOpen !== undefined || !isCollapsed ? "block" : "hidden")}>{name}</span>
                      </Link>
                    );

                    return isCollapsed && isOpen === undefined ? (
                      <Tooltip
                        key={indx}
                        title={<span className="text-primary-text font-medium text-sm">{name}</span>}
                        placement="right"
                        color="var(--primary-bg)"
                        overlayInnerStyle={{
                          border: "1px solid var(--border-primary)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <div className="w-full">{linkContent}</div>
                      </Tooltip>
                    ) : (
                      <React.Fragment key={indx}>
                        {linkContent}
                      </React.Fragment>
                    );
                  }
                )}
            </nav>

            {!isAdmin && visibleUser?.role?.toLowerCase() !== "creator" && (
              <div className={cn("px-2 pt-6 border-t border-border-primary/50", isOpen !== undefined || !isCollapsed ? "block" : "hidden")}>
                <RecentVisit />
              </div>
            )}
          </div>

          {/* Bottom: User Profile & Logout */}
          <div className={cn("mt-auto py-4 border-t border-border-primary bg-primary-bg/50 backdrop-blur-sm shrink-0", isOpen !== undefined || !isCollapsed ? "px-4" : "px-2")}>
            <div className={cn(
              "flex items-center rounded-xl bg-primary-bg border border-border-primary shadow-sm group transition-all hover:border-brand-primary/30",
              isOpen !== undefined || !isCollapsed ? "flex-row p-2.5 gap-3" : "flex-col p-2 gap-3"
            )}>
              <div className={cn("rounded-full overflow-hidden shrink-0 ring-2 ring-brand-primary/20 ring-offset-1 transition-all", isOpen !== undefined || !isCollapsed ? "h-11 w-11" : "h-9 w-9")}>
                <Image
                  src={visibleUser?.avatar}
                  alt={visibleUser?.username || "Profile"}
                  width={120}
                  height={120}
                  quality={95}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>

              <div className={cn("min-w-0 flex-1", isOpen !== undefined || !isCollapsed ? "block" : "hidden")}>
                <h6 className="text-base font-bold truncate text-primary-text leading-tight">
                  {isLoggingOut ? "Signing out..." : visibleUser?.username}
                </h6>
                <p className="text-[11px] font-bold text-brand-primary truncate uppercase tracking-widest mt-0.5">
                  {visibleUser ? getRoleLabel(visibleUser.role as TRole) : ""}
                </p>
              </div>

              <button
                onClick={handleLogOut}
                disabled={isLoggingOut}
                className={cn("text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center", isOpen !== undefined || !isCollapsed ? "p-2 w-auto" : "p-1.5 w-full")}
                title="Logout"
              >
                <PowerIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
