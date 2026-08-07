"use client";

import { useRequireGuest } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { logout } from "@/redux/features/auth/authSlice";

interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function GuestGuard({ children, redirectTo = "/overview" }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useRequireGuest(redirectTo);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [showRescueOption, setShowRescueOption] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const targetPath = user?.role === "Admin" ? "/admin/home" : redirectTo;

      // 1. Soft fallback: force hard page load if SPA router transition stalls > 3.5s
      const hardRedirectTimer = setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname !== targetPath) {
          console.warn("[GuestGuard] SPA navigation delayed. Forcing full page location redirect to:", targetPath);
          window.location.href = targetPath;
        }
      }, 3500);

      // 2. Hard rescue: display emergency manual rescue buttons if page hasn't redirected after 7s
      const rescueTimer = setTimeout(() => {
        setShowRescueOption(true);
      }, 7000);

      return () => {
        clearTimeout(hardRedirectTimer);
        clearTimeout(rescueTimer);
      };
    }
  }, [isAuthenticated, redirectTo, user]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="relative w-full min-h-screen">
        <LoadingScreen
          isVisible={true}
          message={isAuthenticated ? "Redirecting to dashboard..." : "Checking session..."}
          variant="minimal"
        />
        {showRescueOption && isAuthenticated && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] bg-secondary-bg/95 backdrop-blur-md border border-border-primary rounded-xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-3 text-center max-w-md w-11/12">
            <p className="text-sm text-primary-text font-medium m-0">
              Redirection taking longer than expected?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const target = user?.role === "Admin" ? "/admin/home" : redirectTo;
                  window.location.href = target;
                }}
                className="px-3 py-1.5 text-xs rounded-md bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(logout());
                  window.location.href = "/sign-in";
                }}
                className="px-3 py-1.5 text-xs rounded-md bg-transparent border border-border-primary text-muted-text hover:text-primary-text transition-colors"
              >
                Reset & Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
