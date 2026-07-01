import React, { useState } from "react";
import { Button, ConfigProvider, Input, Table, TableColumnsType } from "antd";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAdminWithdrawalsQuery } from "@/redux/features/wallet/wallet.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import { debounceSearch } from "@/utils/debounce";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import CPagination from "@/components/ui/CPagination";
import { TQuery, TUniObject } from "@/types";

interface WithdrawalsTableProps {
  title: string;
  status: "request" | "history";
  onViewDetails: (record: TUniObject, type: "request" | "history") => void;
}

const WithdrawalsTable = ({ title, status, onViewDetails }: WithdrawalsTableProps) => {
  const [query, setQuery] = useState<TQuery<{ status?: string; search?: string }>>({
    page: 1,
    limit: 10,
    status,
  });

  const { data, isLoading, isError, error, isFetching } = useAdminWithdrawalsQuery(
    queryFormat(query)
  );

  const columns: TableColumnsType = [
    {
      title: "User Id",
      dataIndex: ["user", "_id"],
      className: "whitespace-nowrap",
      render: (text) => <p className="font-mono text-xs text-secondary-text whitespace-nowrap">{text}</p>,
    },
    {
      title: "Name",
      dataIndex: ["user", "username"],
      className: "whitespace-nowrap",
      render: (text: string) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">{text}</p>,
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      className: "whitespace-nowrap",
      render: (text: string) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">{text}</p>,
    },
    {
      title: "Request Date",
      dataIndex: "createdAt",
      className: "whitespace-nowrap",
      render: (date) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">{new Date(date).toLocaleString()}</p>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      className: "whitespace-nowrap",
      render: (text) => <p className="text-base font-normal text-secondary-text whitespace-nowrap">${text}</p>,
      align: "center",
    },
    {
      title: "Status",
      className: "whitespace-nowrap",
      render: (record: TUniObject) => {
        const normalized = (record.status || "").toUpperCase();
        return (
          <span
            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
              normalized === "PENDING" || normalized === "PROCESSING"
                ? "bg-warning/10 text-warning"
                : normalized === "COMPLETED"
                  ? "bg-success/10 text-success"
                  : normalized === "REJECTED" || normalized === "FAILED"
                    ? "bg-error/10 text-error"
                    : "bg-muted-text/10 text-secondary-text"
            }`}
          >
            {record.status}
          </span>
        );
      },
      align: "center",
    },
    {
      title: "Action",
      className: "whitespace-nowrap",
      render: (record: TUniObject) => (
        <div className="flex flex-nowrap gap-2 justify-center">
          <Button 
            onClick={() => onViewDetails(record, status)} 
            type="primary"
            className="bg-brand-primary hover:!bg-brand-secondary border-none px-6 rounded-md whitespace-nowrap"
          >
            View details
          </Button>
        </div>
      ),
      align: "center",
    },
  ];

  return (
    <div className="w-full bg-primary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-secondary-bg border-b border-border-primary px-6 py-4">
        <h3 className="text-xl font-semibold text-primary-text m-0 whitespace-nowrap">
          {title} ({data?.data?.meta?.total || data?.data?.totalResults || 0})
        </h3>
        
        <ConfigProvider
          theme={{
            components: {
              Input: { borderRadius: 6 },
            },
          }}
        >
          <div className="flex flex-nowrap items-center justify-start lg:justify-end gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
            <Input
              onChange={(e) =>
                debounceSearch({
                  setter: setQuery,
                  newValue: e.target.value,
                  name: "search",
                })
              }
              placeholder="Search user by name, email, or ID.."
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
              dataSource={data?.data?.withdrawals || data?.data?.results}
              pagination={false}
              rowKey={"_id"}
              loading={isFetching}
              className="!rounded-none border-0 whitespace-nowrap"
              locale={{ emptyText: "No requests found" }}
            />
          </div>
          {(data?.data?.withdrawals?.length || data?.data?.results?.length || 0) > 0 && (
            <div className="p-4 border-t border-border-primary bg-primary-bg">
              <CPagination
                setQuery={setQuery}
                query={query}
                totalData={data?.data?.meta?.total || data?.data?.totalResults}
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

export default WithdrawalsTable;
