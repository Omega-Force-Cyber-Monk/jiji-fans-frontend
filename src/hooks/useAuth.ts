import { useAppSelector } from "@/redux/hook";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = () => {
  const { user, token, isLoading } = useAppSelector((state) => state.auth);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "Admin";
  const isCreator = user?.role === "Creator";
  const isUser = user?.role === "User";

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isCreator,
    isUser,
  };
};

export const useRequireAuth = (redirectTo: string = "/sign-in") => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};

export const useRequireGuest = (redirectTo: string = "/overview") => {
  const router = useRouter();
  const { isAuthenticated, isLoading, isAdmin, isCreator } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect based on role
      if (isAdmin) {
        router.replace("/admin/home");
      } else if (isCreator) {
        router.replace("/overview");
      } else {
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo, isAdmin, isCreator]);

  return { isAuthenticated, isLoading };
};

export const useRequireRole = (allowedRoles: string[], redirectTo: string = "/") => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin, isCreator } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/sign-in");
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        // Redirect to role-specific page based on user's actual role
        let targetPath = redirectTo;
        if (isAdmin) {
          targetPath = "/admin/home";
        } else if (isCreator) {
          targetPath = "/overview";
        } else {
          targetPath = "/overview";
        }
        router.replace(targetPath);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo, isAdmin, isCreator]);

  const hasAccess = user ? allowedRoles.includes(user.role) : false;

  return { isAuthenticated, isLoading, hasAccess };
};
