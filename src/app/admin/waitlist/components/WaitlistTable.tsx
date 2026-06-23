"use client";

import React, { useMemo, useState } from "react";
import { ConfigProvider, Input, Select, Table, TableColumnsType } from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { TQuery } from "@/types";
import { useGetCreatorWaitlistQuery, TCreatorWaitlistEntry } from "@/redux/features/creatorWaitlist/creatorWaitlist.api";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import { debounceSearch } from "@/utils/debounce";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";
import Image from "@/components/ui/CImage";

type TTableEntry = {
  key: string;
  _id: string;
  fullName: string;
  emailAddress?: string;
  whatsappNumber?: string;
  creatorCategory: string;
  categoryIcon?: string;
  createdAt: string;
};

interface TIncomingEntry extends Omit<TCreatorWaitlistEntry, "categoryId"> {
  categoryId?: string | {
    _id: string;
    name: string;
    icon?: string;
  };
  fullName?: string;
  emailAddress?: string;
  whatsappNumber?: string;
  creatorCategory?: string;
  category?: {
    _id?: string;
    name?: string;
    icon?: string;
  };
}

const ALL_CATEGORIES = "ALL";

const WaitlistTable = () => {
  const [query, setQuery] = useState<
    TQuery<{
      categoryId?: string;
      search?: string;
      name?: string;
      email?: string;
      whatsapp?: string;
    }>
  >({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error, isFetching } = useGetCreatorWaitlistQuery(
    queryFormat(query)
  );

  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const categoriesList = useMemo(() => categoriesData?.data?.categories || [], [categoriesData]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; icon?: string }>();
    categoriesList.forEach((cat) => {
      map.set(cat._id, { name: cat.name, icon: cat.icon });
    });
    return map;
  }, [categoriesList]);

  const waitlistEntries = useMemo<TTableEntry[]>(() => {
    const rawList = data?.data?.waitlist;
    if (!Array.isArray(rawList)) return [];
    return rawList.map((item: TIncomingEntry) => {
      let catName = "N/A";
      let catIcon = undefined;

      if (item.categoryId && typeof item.categoryId === "object") {
        catName = item.categoryId.name || "N/A";
        catIcon = item.categoryId.icon;
      } else if (typeof item.categoryId === "string") {
        const resolved = categoryMap.get(item.categoryId);
        if (resolved) {
          catName = resolved.name;
          catIcon = resolved.icon;
        }
      }

      if (catName === "N/A") {
        catName = item.category?.name || item.creatorCategory || "N/A";
        catIcon = catIcon || item.category?.icon;
      }

      return ({
        key: item._id,
        _id: item._id,
        fullName: item.name || item.fullName || "N/A",
        emailAddress: item.email || item.emailAddress || "N/A",
        whatsappNumber: item.whatsapp || item.whatsappNumber || "N/A",
        creatorCategory: catName,
        categoryIcon: catIcon,
        createdAt: item.createdAt,
      });
    });
  }, [data, categoryMap]);

  const columns: TableColumnsType<TTableEntry> = [
    {
      title: "ID",
      dataIndex: "_id",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <p className="text-sm font-normal text-secondary-text whitespace-nowrap">
          {text?.slice(-6).toUpperCase() || text}
        </p>
      ),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <p className="text-sm font-semibold text-primary-text whitespace-nowrap">
          {text || "N/A"}
        </p>
      ),
    },
    {
      title: "Email Address",
      dataIndex: "emailAddress",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <p className="text-sm font-normal text-secondary-text whitespace-nowrap">
          {text || "N/A"}
        </p>
      ),
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsappNumber",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <p className="text-sm font-normal text-secondary-text whitespace-nowrap">
          {text || "N/A"}
        </p>
      ),
    },
    {
      title: "Category",
      className: "whitespace-nowrap",
      render: (_, record: TTableEntry) => (
        <div className="flex items-center gap-2">
          {record.categoryIcon ? (
            <div className="relative size-10 rounded-full overflow-hidden border border-border-primary shrink-0">
              <Image
                src={record.categoryIcon}
                alt={record.creatorCategory}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="size-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-[10px] font-semibold shrink-0">
              {record.creatorCategory.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="inline-flex rounded-md bg-brand-primary/10 text-brand-primary px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
            {record.creatorCategory}
          </span>
        </div>
      ),
    },
    {
      title: "Date Joined",
      dataIndex: "createdAt",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <p className="text-sm font-normal text-muted-text whitespace-nowrap">
          {text ? new Date(text).toLocaleDateString() : "N/A"}
        </p>
      ),
      align: "center",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-6 py-6">
        {/* <h3 className="text-2xl font-semibold text-primary-text m-0 whitespace-nowrap">
          Waitlist ({data?.data?.pagination?.total || 0})
        </h3> */}
        <ConfigProvider
          theme={{
            components: {
              Input: { borderRadius: 6 },
              Select: { borderRadius: 6 },
            },
          }}
        >
          <div className="flex flex-nowrap items-center justify-start lg:justify-end gap-6 w-full lg:w-auto overflow-x-auto pb-6 lg:pb-0 scrollbar-hide">
            <Select
              placeholder="Category"
              className="w-48 min-w-[190px] h-10!"
              value={query.categoryId ?? ALL_CATEGORIES}
              onChange={(value) =>
                setQuery((prev) => ({
                  ...prev,
                  categoryId:
                    value === ALL_CATEGORIES
                      ? undefined
                      : value,
                  page: 1,
                }))
              }
              options={[
                { label: "All Categories", value: ALL_CATEGORIES },
                ...categoriesList.map((cat) => ({
                  label: cat.name,
                  value: cat._id,
                })),
              ]}
            />
            <Input
              onChange={(e) =>
                debounceSearch({
                  setter: setQuery,
                  newValue: e.target.value,
                  name: "search",
                })
              }
              placeholder="Search by name/email..."
              suffix={<MagnifyingGlassIcon className="w-5 text-muted-text" />}
              className="w-64 min-w-[250px] h-10 bg-primary-bg border-border-primary text-primary-text"
            />
          </div>
        </ConfigProvider>
      </div>

      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        className="min-h-[200px]"
      >
        <div className="p-0">
          <div className="w-full overflow-x-auto">
            <Table
              columns={columns}
              dataSource={waitlistEntries}
              pagination={false}
              rowKey={"_id"}
              loading={isFetching}
              className="!rounded-none border-0 whitespace-nowrap"
              locale={{ emptyText: "No waitlist entries found" }}
            />
          </div>
          {waitlistEntries.length > 0 && (
            <div className="p-6 border-t border-border-primary bg-primary-bg">
              <CPagination
                setQuery={setQuery}
                query={query}
                totalData={data?.data?.pagination?.total || waitlistEntries.length}
                showSizeChanger={false}
                showQuickJumper={false}
                customNavigation={false}
                size="default"
                className="!m-0 flex justify-end"
              />
            </div>
          )}
        </div>
      </LoaderWraperComp>
    </div>
  );
};

export default WaitlistTable;
