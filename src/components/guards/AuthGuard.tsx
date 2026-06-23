"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = "/sign-in" }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useRequireAuth(redirectTo);

  return (
    <>
      <LoadingScreen
        isVisible={isLoading}
        message="Verifying authentication..."
        variant="minimal"
      />
      {!isLoading && isAuthenticated && children}
    </>
  );
}
