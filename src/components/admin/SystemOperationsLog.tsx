import React, { useState } from "react";
import { Table, TableColumnsType, Modal } from "antd";
import { cn } from "@/utils/cn";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import CPagination from "@/components/ui/CPagination";

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
  searchVal?: string;
  onSearchChange?: (val: string) => void;
  statusVal?: string;
  onStatusChange?: (val: string) => void;
  actorIdVal?: string;
  onActorIdChange?: (val: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  isDashboard?: boolean;
}

const SystemOperationsLog: React.FC<SystemOperationsLogProps> = ({
  transactions = [],
  loading = false,
  searchVal = "",
  onSearchChange,
  statusVal = "",
  onStatusChange,
  actorIdVal = "",
  onActorIdChange,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  isDashboard = false,
}) => {
  const [selectedLog, setSelectedLog] = useState<TTransaction | null>(null);

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;
    const headers = ["Log ID", "User / Creator", "Action Type", "Amount", "Date", "Status"];
    const rows = transactions.map(t => [
      t.id,
      t.creator,
      t.type,
      t.amount,
      t.date,
      t.label
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system_logs_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    {
      title: "Action",
      className: "whitespace-nowrap",
      render: (_, record) => (
        <button
          onClick={() => setSelectedLog(record)}
          className="bg-brand-primary hover:opacity-90 transition-all text-white px-3.5 py-1.5 rounded-md text-xs font-semibold border-none cursor-pointer"
        >
          View details
        </button>
      ),
    },
  ];

  return (
    <div className="bg-secondary-bg border border-border-primary rounded-lg p-5 shadow-sm overflow-hidden hover:border-brand-primary">
      <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-primary-text">
            System Operations Log
          </h3>
          <p className="text-sm text-muted-text font-normal mt-0.5">
            Detailed transaction, payout, and KYC verification records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isDashboard && (
            <>
              <select
                value={statusVal}
                onChange={(e) => onStatusChange?.(e.target.value)}
                className="px-3.5 py-1.5 bg-primary-bg border border-border-primary rounded-md text-sm text-primary-text focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
              <input
                type="text"
                placeholder="Creator ID"
                value={actorIdVal}
                onChange={(e) => onActorIdChange?.(e.target.value)}
                className="px-3.5 py-1.5 bg-primary-bg border border-border-primary rounded-md text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:border-brand-primary transition-all"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="px-3.5 py-1.5 bg-primary-bg border border-border-primary rounded-md text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:border-brand-primary transition-all"
              />
            </>
          )}
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-brand-primary rounded-md text-sm font-semibold text-white dark:text-black hover:opacity-90 transition-all border-none cursor-pointer"
          >
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
          locale={{
            emptyText: (
              <div className="text-center py-10 flex flex-col items-center justify-center gap-2 bg-secondary-bg/30 border border-dashed border-border-primary/50 rounded-lg">
                <ClockIcon className="w-8 h-8 text-muted-text/40 animate-pulse" />
                <p className="text-sm text-muted-text font-medium">No system operations logs found.</p>
              </div>
            )
          }}
          className="ant-table-custom"
          size="middle"
        />
      </div>

      {!isDashboard && total > 0 && onPageChange && (
        <CPagination
          totalData={total}
          query={{ page, limit: pageSize }}
          setQuery={(updateFn: any) => {
            const nextVal = typeof updateFn === "function" ? updateFn({ page, limit: pageSize }) : updateFn;
            onPageChange(nextVal.page, nextVal.limit);
          }}
          minCount={0}
          customNavigation={false}
        />
      )}

      {isDashboard && (
        <div className="mt-5 flex justify-center border-t border-border-primary/50 pt-4">
          <Link href="/admin/system-logs" className="px-5 py-2 rounded bg-primary-bg border border-border-primary text-sm font-semibold text-primary-text hover:bg-secondary-bg hover:border-brand-primary transition-all">
            View All Logs
          </Link>
        </div>
      )}

      {/* Premium Log Details Modal */}
      <Modal
        title="Operational Log Details"
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        centered
        className="dark:bg-secondary-bg"
      >
        {selectedLog && (
          <div className="space-y-4 pt-3 text-primary-text">
            <div>
              <span className="text-xs text-muted-text uppercase block font-semibold">Log ID</span>
              <span className="font-mono text-sm font-semibold">{selectedLog.key}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-text uppercase block font-semibold">Actor</span>
                <span className="text-sm font-semibold">{selectedLog.creator}</span>
              </div>
              <div>
                <span className="text-xs text-muted-text uppercase block font-semibold">Action Type</span>
                <span className="text-sm font-semibold">{selectedLog.type}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-text uppercase block font-semibold">Amount</span>
                <span className="text-sm font-semibold text-brand-primary">{selectedLog.amount}</span>
              </div>
              <div>
                <span className="text-xs text-muted-text uppercase block font-semibold">Date</span>
                <span className="text-sm font-semibold">{selectedLog.date}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-text uppercase block font-semibold">Status</span>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mt-1",
                selectedLog.status === "success" && "bg-success/10 text-success border border-success/20",
                selectedLog.status === "warning" && "bg-warning/10 text-warning border border-warning/20",
                selectedLog.status === "error" && "bg-error/10 text-error border border-error/20"
              )}>
                {selectedLog.label}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemOperationsLog;
