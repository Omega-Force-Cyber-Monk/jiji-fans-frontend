"use client";

import { cn } from "../../utils/cn";
import { usePathname } from "next/navigation";
import { IconType } from "@/types/sidebar.type";
import AppBreadcrumb from "./AppBreadcrumb";

const PageHeading = ({
  title,
  hideIcon = false,
  className,
  showBreadcrumb,
  breadcrumbItems,
}: {
  title: string;
  backPath?: string;
  hideIcon?: boolean;
  className?: string;
  backIcon?: IconType;
  showBreadcrumb?: boolean;
  breadcrumbItems?: { title: string; href?: string }[];
}) => {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");
  const shouldShowBreadcrumb =
    showBreadcrumb !== false && (isAdminRoute || showBreadcrumb || breadcrumbItems);

  const defaultItems = [
    {
      title: isAdminRoute ? "Admin" : "Home",
      href: isAdminRoute ? "/admin/home" : "/overview",
    },
    { title },
  ];

  return (
    <div className={cn("flex flex-col gap-1.5 mb-6", className)}>
      {shouldShowBreadcrumb && (
        <AppBreadcrumb items={breadcrumbItems || defaultItems} />
      )}
    </div>
  );
};

export default PageHeading;
