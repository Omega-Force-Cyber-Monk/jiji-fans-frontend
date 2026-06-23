import React from "react";
import type { PaginationProps } from "antd";
import { Pagination, ConfigProvider } from "antd";
import { cn } from "../../utils/cn";
import { TQuery, TSetQuery } from "@/types";

type TProps = {
  className?: string;
  totalData: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  customNavigation?: boolean;
  minCount?: number;
  setQuery: TSetQuery;
  query: TQuery;
  size?: "small" | "default";
};

const itemRender: PaginationProps["itemRender"] = (
  _,
  type,
  originalElement
) => {
  if (type === "prev") {
    return (
      <button className="border border-border-primary bg-secondary-bg text-primary-text hover:border-brand-primary outline-hidden rounded-md px-8 py-2 text-sm transition-all cursor-pointer">
        Previous
      </button>
    );
  }
  if (type === "next") {
    return (
      <button className="border border-border-primary bg-secondary-bg text-primary-text hover:border-brand-primary outline-hidden rounded-md px-8 py-2 text-sm transition-all cursor-pointer">
        Next
      </button>
    );
  }
  return originalElement;
};

const CPagination: React.FC<TProps> = ({
  className,
  totalData,
  showSizeChanger = true,
  showQuickJumper = true,
  customNavigation = true,
  setQuery,
  minCount = 10,
  query,
  size = "default",
}) => {
  if (totalData > minCount) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorText: "var(--primary-text)",
            colorBgContainer: "var(--primary-bg)",
            colorBorder: "var(--border-primary)",
            colorPrimary: "var(--brand-primary)",
            colorTextDisabled: "var(--muted-text)",
            borderRadius: 6,
          },
          components: {
            Pagination: {
              itemActiveBg: "var(--brand-primary)",
              itemActiveColor: "#ffffff",
              itemBg: "var(--secondary-bg)",
              itemLinkBg: "var(--secondary-bg)",
            },
          },
        }}
      >
        <div className={cn("w-full flex justify-center py-10", className)}>
          <Pagination
            size={size === "small" ? "default" : size} // Force medium/default design
            itemRender={customNavigation ? itemRender : undefined}
            align="center"
            showQuickJumper={showQuickJumper}
            showSizeChanger={showSizeChanger}
            total={totalData || 1}
            current={query.page}
            defaultCurrent={1}
            onChange={(page) => setQuery((c) => ({ ...c, page }))}
            pageSize={query.limit}
            onShowSizeChange={(_current, size) =>
              setQuery((c) => ({ ...c, limit: size }))
            }
          />
        </div>
      </ConfigProvider>
    );
  }
  return null;
};

export default CPagination;
