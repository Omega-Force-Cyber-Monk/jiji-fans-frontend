import React from "react";
import { Table, TableColumnsType } from "antd";
import { cn } from "@/utils/cn";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export interface TTransaction {
  key: string;
  id: string;
  creator: string;
  type: string;
  amount: string;
  date: string;
  status: "success" | "warning" | "error" | string;
  label: string;
}

const MOCK_TRANSACTIONS: TTransaction[] = [
  {
    key: "TX-1004",
    id: "TX-1004",
    creator: "David Attenborough",
    type: "Payout Withdrawal",
    amount: "$1,250.00",
    date: "May 21, 2026",
    status: "success",
    label: "Completed",
  },
  {
    key: "TX-1003",
    id: "TX-1003",
    creator: "Selena Gomez",
    type: "KYC Verification",
    amount: "--",
    date: "May 20, 2026",
    status: "warning",
    label: "Under Review",
  },
  {
    key: "TX-1002",
    id: "TX-1002",
    creator: "Marcus Rashford",
    type: "Subscription Payout",
    amount: "$420.50",
    date: "May 19, 2026",
    status: "success",
    label: "Completed",
  },
  {
    key: "TX-1001",
    id: "TX-1001",
    creator: "Billie Eilish",
    type: "Report Resolution",
    amount: "--",
    date: "May 18, 2026",
    status: "error",
    label: "Flagged/Suspended",
  },
];

interface SystemOperationsLogProps {
  transactions?: TTransaction[];
  loading?: boolean;
}

const SystemOperationsLog: React.FC<SystemOperationsLogProps> = ({
  transactions = MOCK_TRANSACTIONS,
  loading = false,
}) => {
  const columns: TableColumnsType<TTransaction> = [
    {
      title: "Log ID",
      dataIndex: "id",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <span className="font-mono text-sm font-semibold text-primary-text pl-2">
          {text}
        </span>
      ),
    },
    {
      title: "User / Creator",
      dataIndex: "creator",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <span className="text-sm font-semibold text-primary-text">
          {text}
        </span>
      ),
    },
    {
      title: "Action Type",
      dataIndex: "type",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <span className="text-sm text-secondary-text font-normal">
          {text}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <span className="text-sm font-semibold text-primary-text">
          {text}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      className: "whitespace-nowrap",
      render: (text: string) => (
        <span className="text-sm text-muted-text font-normal">
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      className: "whitespace-nowrap",
      align: "center",
      render: (status: string, record) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap",
            status === "success" &&
            "bg-success/10 text-success border border-success/20",
            status === "warning" &&
            "bg-warning/10 text-warning border border-warning/20",
            status === "error" &&
            "bg-error/10 text-error border border-error/20"
          )}
        >
          {status === "success" && (
            <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
          )}
          {status === "warning" && (
            <ClockIcon className="w-3.5 h-3.5 shrink-0" />
          )}
          {status === "error" && (
            <XCircleIcon className="w-3.5 h-3.5 shrink-0" />
          )}
          {record.label}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-secondary-bg border border-border-primary rounded-lg p-5 shadow-sm overflow-hidden hover:border-brand-primary">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-primary-text">
            System Operations Log
          </h3>
          <p className="text-sm text-muted-text font-normal mt-0.5">
            Detailed transaction, payout, and KYC verification records
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-1.5 bg-primary-bg border border-border-primary rounded-md text-sm font-semibold text-primary-text hover:bg-secondary-bg transition-all cursor-pointer">
            Filter Log
          </button>
          <button className="px-3.5 py-1.5 bg-brand-primary rounded-md text-sm font-semibold text-white dark:text-balck hover:opacity-90 transition-all border-none cursor-pointer">
            Export CSV
          </button>
        </div>
      </div>

      {/* Standard Design Token Antd Table */}
      <div className="w-full overflow-x-auto">
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          pagination={false}
          locale={{ emptyText: "No operational logs" }}
          className="ant-table-custom"
          size="middle"
        />
      </div>
    </div>
  );
};

export default SystemOperationsLog;
