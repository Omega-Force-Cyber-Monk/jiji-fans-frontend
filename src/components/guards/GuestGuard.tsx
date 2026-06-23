"use client";

import { useRequireGuest } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ReactNode } from "react";

interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function GuestGuard({ children, redirectTo = "/overview" }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useRequireGuest(redirectTo);

  return (
    <>
      <LoadingScreen 
        isVisible={isLoading} 
        message="Checking session..." 
        variant="minimal" 
      />
      {!isLoading && !isAuthenticated && children}
    </>
  );
}
