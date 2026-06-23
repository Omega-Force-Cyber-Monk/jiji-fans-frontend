"use client";

import { useRequireRole } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/",
  fallback
}: RoleGuardProps) {
  const { isAuthenticated, isLoading, hasAccess } = useRequireRole(allowedRoles, redirectTo);

  return (
    <>
      <LoadingScreen
        isVisible={isLoading || (!isAuthenticated && !fallback) || (!hasAccess && !fallback)}
        message={isLoading ? "Verifying permissions..." : "Redirecting..."}
        variant="minimal"
      />
      {!isLoading && isAuthenticated && hasAccess && children}
      {!isLoading && (!isAuthenticated || !hasAccess) && fallback}
    </>
  );
}
