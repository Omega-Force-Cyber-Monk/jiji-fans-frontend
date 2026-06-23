"use client";

/**
 * AppBreadcrumb
 *
 * Wraps Ant Design's <Breadcrumb> and replaces every <a href> link with a
 * Next.js <Link> — so breadcrumb clicks do client-side navigation instead of
 * triggering a full page reload (and re-firing the LoadingScreen preloader).
 */

import { Breadcrumb } from "antd";
import type { BreadcrumbProps } from "antd";
import NextLink from "next/link";
import { cn } from "@/utils/cn";

type AppBreadcrumbProps = {
  items: { title: string; href?: string }[];
  className?: string;
};

const AppBreadcrumb = ({ items, className }: AppBreadcrumbProps) => {
  const antdItems: BreadcrumbProps["items"] = items.map((item) => ({
    title: item.href ? (
      <NextLink
        href={item.href}
        className="hover:text-brand-primary transition-colors"
      >
        {item.title}
      </NextLink>
    ) : (
      <span>{item.title}</span>
    ),
  }));

  return (
    <Breadcrumb
      items={antdItems}
      className={cn("text-sm", className)}
    />
  );
};

export default AppBreadcrumb;
