import React, { useMemo, useState } from "react";
import { Button, ConfigProvider, Input, Select, Table, TableColumnsType } from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { TQuery } from "@/types";
import { useGetKycApplicationsQuery } from "@/redux/features/kyc/adminKYC/adminKyc.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import { debounceSearch } from "@/utils/debounce";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";
import {
  KYC_REQUEST_STATUS,
  KYC_TYPES,
  TKycRequestStatus,
  TKycType,
} from "@/constants/kyc.const";

type TKycApplication = {
  _id: string;
  type?: "KYC" | "KYB" | string;
  status?: string;
  creator?: {
    username?: string;
    email?: string;
    address?: string;
  };
  data?: {
    businessName?: string;
    address?: string;
  };
};

const ALL_KYC_STATUS = "ALL";

interface KycTableProps {
  title: string;
  type: TKycType;
}

const KycTable = ({ title, type }: KycTableProps) => {
  const [query, setQuery] = useState<
    TQuery<{
      status?: TKycRequestStatus;
      type?: TKycType;
      creatorId?: string;
      search?: string;
    }>
  >({
    page: 1,
    limit: 10,
    type: type,
  });

  const { data, isLoading, isError, error, isFetching } = useGetKycApplicationsQuery(
    queryFormat(query)
  );

  const applications = useMemo<TKycApplication[]>(() => {
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const columns: TableColumnsType<TKycApplication> = [
    {
      title: "ID",
      dataIndex: "_id",
      className: "whitespace-nowrap",
      render: (text: string) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">{text?.slice(-6).toUpperCase() || text}</p>,
    },
    {
      title: "Application",
      dataIndex: "type",
      className: "whitespace-nowrap",
      render: (text: string) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">{text || "N/A"}</p>,
      align: "center",
    },
    {
      title: type === KYC_TYPES.KYC ? "User Name" : "Business Name",
      className: "whitespace-nowrap",
      render: (record: TKycApplication) => (
        <p className="text-base font-normal text-secondary-text whitespace-nowrap">
          {record?.type === KYC_TYPES.KYB
            ? record?.data?.businessName || "N/A"
            : record?.creator?.username || "N/A"}
        </p>
      ),
    },
    {
      title: "Email",
      dataIndex: "creator",
      className: "whitespace-nowrap",
      render: (creator: TKycApplication["creator"]) => (
        <p className="text-base font-normal text-secondary-text whitespace-nowrap">{creator?.email || "N/A"}</p>
      ),
    },
    {
      title: "Address",
      className: "whitespace-nowrap",
      render: (record: TKycApplication) => (
        <p className="text-base font-normal text-secondary-text whitespace-nowrap truncate max-w-[200px]" title={record?.data?.address || record?.creator?.address || "N/A"}>
          {record?.data?.address || record?.creator?.address || "N/A"}
        </p>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      className: "whitespace-nowrap",
      render: (text: string) => {
        const normalized = (text || "").toUpperCase();
        return (
          <span
            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${normalized === "PENDING"
              ? "bg-warning/10 text-warning"
              : normalized === "APPROVED"
                ? "bg-success/10 text-success"
                : normalized === "REJECTED"
                  ? "bg-error/10 text-error"
                  : "bg-muted-text/10 text-secondary-text"
              }`}
          >
            {normalized || "N/A"}
          </span>
        );
      },
      align: "center",
    },
    {
      title: "Action",
      className: "whitespace-nowrap",
      render: (record: TKycApplication) => (
        <Link href={`/admin/kyc-applications/${record._id}`}>
          <Button
            type="primary"
            className="bg-brand-primary hover:!bg-brand-secondary border-none px-6 rounded-md whitespace-nowrap"
          >
            View details
          </Button>
        </Link>
      ),
      align: "center",
    },
  ];

  return (
    <div className="w-full bg-primary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-secondary-bg border-b border-border-primary px-6 py-4">
        <h3 className="text-xl font-semibold text-primary-text m-0 whitespace-nowrap">
          {title} ({data?.totalResults || 0})
        </h3>

        <ConfigProvider
          theme={{
            components: {
              Input: { borderRadius: 6 },
              Select: { borderRadius: 6 },
            },
          }}
        >
          <div className="flex flex-nowrap items-center justify-start lg:justify-end gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
            <Select
              placeholder="Status"
              className="w-40 min-w-[160px] h-10!"
              value={query.status ?? ALL_KYC_STATUS}
              onChange={(value) =>
                setQuery((prev) => ({
                  ...prev,
                  status:
                    value === ALL_KYC_STATUS
                      ? undefined
                      : (value as TKycRequestStatus),
                  page: 1,
                }))
              }
              options={[
                { label: "All Status", value: ALL_KYC_STATUS },
                ...Object.values(KYC_REQUEST_STATUS).map((status) => ({
                  label: status,
                  value: status,
                })),
              ]}
            />
            <Input
              value={query.creatorId}
              onChange={(e) =>
                setQuery((prev) => ({
                  ...prev,
                  creatorId: e.target.value || undefined,
                  page: 1,
                }))
              }
              placeholder="Creator ID"
              className="w-40 min-w-[160px] h-10 bg-primary-bg border-border-primary text-primary-text"
            />
            <Input
              onChange={(e) =>
                debounceSearch({
                  setter: setQuery,
                  newValue: e.target.value,
                  name: "search",
                })
              }
              placeholder="Search..."
              suffix={<MagnifyingGlassIcon className="w-5 text-muted-text" />}
              className="w-60 min-w-[240px] h-10 bg-primary-bg border-border-primary text-primary-text"
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
              dataSource={applications}
              pagination={false}
              rowKey={"_id"}
              loading={isFetching}
              className="!rounded-none border-0 whitespace-nowrap"
              locale={{ emptyText: "No applications found" }}
            />
          </div>
          {applications.length > 0 && (
            <div className="p-4 border-t border-border-primary bg-primary-bg">
              <CPagination
                setQuery={setQuery}
                query={query}
                totalData={data?.totalResults || applications.length}
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

export default KycTable;
