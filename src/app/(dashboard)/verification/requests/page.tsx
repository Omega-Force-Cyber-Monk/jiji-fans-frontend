"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select, Table, TableColumnsType } from "antd";
import PageHeading from "@/components/ui/PageHeading";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";
import { TQuery } from "@/types";
import { queryFormat } from "@/lib/helpers/queryFormat";
import { useGetMyKycRequestsQuery } from "@/redux/features/kyc/userKYC/userKyc.api";
import {
  setSelectedKycRequest,
  TKycRequestState,
} from "@/lib/state/kycRequestState";
import {
  KYC_REQUEST_STATUS,
  TKycRequestStatus,
} from "@/constants/kyc.const";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import KycRequestsSkeleton from "@/Common/Skeleton/app/(dashboard)/verification/requests/KycRequestsSkeleton";

type TKycType = "KYC" | "KYB";
type TKycStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

type TKycRequest = {
  _id: string;
  type: TKycType;
  status: TKycStatus;
  note?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  data?: {
    legalName?: string;
    dateOfBirth?: string;
    idNumber?: string;
    businessName?: string;
    registrationNumber?: string;
    address?: string;
    proofOfIdentityUrl?: string;
    proofOfAddressUrl?: string;
    selfieUrl?: string;
    certificationOfIncorporationUrl?: string;
    businessRegistrationDocumentUrl?: string;
    shareHoldingDocumentUrl?: string;
    proofOfBusinessAddressUrl?: string;
    businessAccountStatementUrl?: string;
  };
};

const ALL_KYC_STATUS = "ALL";

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

const CreatorKycRequestsPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState<TQuery<{ status?: TKycRequestStatus }>>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error } = useGetMyKycRequestsQuery(
    queryFormat(query)
  );

  const requests: TKycRequest[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const totalResults = useMemo(() => {
    if (typeof data?.totalResults === "number") return data.totalResults;
    return requests.length;
  }, [data, requests.length]);

  const columns: TableColumnsType<TKycRequest> = [
    {
      title: "Request ID",
      dataIndex: "_id",
      render: (value: string) => (
        <span className="font-mono text-sm">
          {value?.slice(-8).toUpperCase() || "N/A"}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      align: "center",
      render: (value: TKycType) => (
        <span className="inline-flex items-center px-3 py-1.5 rounded-sm text-sm font-semibold border bg-brand-primary/10 text-brand-primary border-brand-primary/20">
          {value || "N/A"}
        </span>
      ),
    },
    {
      title: "Name / Business",
      render: (record: TKycRequest) => (
        <span className="text-primary-text font-medium text-sm">
          {record?.type === "KYB"
            ? record?.data?.businessName || "N/A"
            : record?.data?.legalName || "N/A"}
        </span>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      render: (value?: string) => (
        <span className="text-secondary-text text-sm">
          {formatDate(value)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: TKycStatus) => {
        const map: Record<
          string,
          { color: string; bg: string }
        > = {
          APPROVED: {
            color: "text-success",
            bg: "bg-success/10 border-success/20",
          },
          COMPLETED: {
            color: "text-success",
            bg: "bg-success/10 border-success/20",
          },
          PENDING: {
            color: "text-warning",
            bg: "bg-warning/10 border-warning/20",
          },
          REJECTED: {
            color: "text-error",
            bg: "bg-error/10 border-error/20",
          },
        };
        const cfg = map[status] || {
          color: "text-muted-text",
          bg: "bg-secondary-bg border-border-primary",
        };
        return (
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-sm text-sm font-semibold border ${cfg.bg} ${cfg.color}`}
          >
            {status}
          </span>
        );
      },
      align: "center",
    },
    {
      title: "Action",
      align: "center",
      render: (record: TKycRequest) => (
        <button
          className="px-4 py-2 rounded-md bg-brand-primary text-black text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-brand-primary/20 flex items-center justify-center shrink-0 cursor-pointer mx-auto"
          onClick={() => {
            setSelectedKycRequest(record as TKycRequestState);
            router.push(`/verification/requests/${record._id}`);
          }}
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header and Breadcrumbs */}
      <div className="space-y-6 pt-4">
        <AppBreadcrumb
          items={[
            { title: "Home", href: "/overview" },
            { title: "Verification", href: "/verification" },
            { title: "Requests" },
          ]}
          className="text-xs text-muted-text"
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <PageHeading title="Verification Requests" />
            <h1 className="text-2xl font-semibold text-primary-text">
              Verification Requests
            </h1>
            <p className="text-base text-secondary-text">
              Track the status of your KYC/KYB identity verification submissions.
            </p>
          </div>
          <Link href="/verification" className="shrink-0">
            <button className="px-4 py-2 rounded-md bg-brand-primary text-black text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-brand-primary/20 flex items-center justify-center text-white shrink-0">
              Start Verification
            </button>
          </Link>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4  pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-text">
              Active Filter:
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold border bg-primary-bg border-border-primary text-secondary-text">
              {query.status || "ALL"}
            </span>
          </div>

          <Select
            placeholder="Filter by status"
            className="min-w-44 h-10 rounded-md"
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
        </div>

        <LoaderWraperComp
          isError={isError}
          isLoading={isLoading}
          error={error}
          dataEmpty={!isLoading && requests.length === 0}
          className="h-[40vh]"
          loader={<KycRequestsSkeleton />}
        >
          <div className="w-full overflow-x-auto rounded-md border border-border-primary">
            <Table
              columns={columns}
              dataSource={requests}
              pagination={false}
              rowKey="_id"
              className="bg-transparent"
            />
          </div>
          <CPagination
            setQuery={setQuery}
            query={query}
            totalData={totalResults}
            showSizeChanger={false}
            showQuickJumper={false}
            customNavigation={false}
            size="default"
            className="py-6 pt-6"
          />
        </LoaderWraperComp>
      </div>
    </div>
  );
};

export default CreatorKycRequestsPage;
