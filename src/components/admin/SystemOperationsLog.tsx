import React, { useState } from "react";
import { Modal } from "antd";
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
  actionTypeVal?: string;
  onActionTypeChange?: (val: string) => void;
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
  actionTypeVal = "",
  onActionTypeChange,
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
    link.setAttribute("download", `system_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



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
                className="px-3.5 py-1.5 bg-primary-bg border border-border-primary rounded-md text-sm text-primary-text focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
              <select
                value={actionTypeVal}
                onChange={(e) => onActionTypeChange?.(e.target.value)}
                className="px-3.5 py-1.5 bg-primary-bg border border-border-primary rounded-md text-sm text-primary-text focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="">All Actions</option>
                <option value="TRANSACTION_CREATED">Transaction Created</option>
                <option value="KYC_SYNCED">KYC Synced</option>
                <option value="PAYOUT_PROCESSED">Payout Processed</option>
                <option value="PAYOUT_FAILED">Payout Failed</option>
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

      {/* Custom Table Component */}
      <div className="w-full overflow-x-auto rounded-lg border border-border-primary bg-secondary-bg/20">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-primary bg-primary-bg/40">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">Log ID</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">User / Creator</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">Action Type</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">Amount</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">Date</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary-text">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary-text text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-sm text-muted-text">Loading logs...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 bg-secondary-bg/30 border border-dashed border-border-primary/50 rounded-lg py-10">
                    <ClockIcon className="w-8 h-8 text-muted-text/40 animate-pulse" />
                    <p className="text-sm text-muted-text font-medium">No system operations logs found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((item) => {
                const s = item.status?.toLowerCase();
                const isSuccess = s === "success" || s === "completed";
                const isWarning = s === "warning" || s === "pending" || s === "under review";
                const isError = s === "error" || s === "failed" || s === "flagged/suspended";

                return (
                  <tr key={item.key} className="border-b border-border-primary/40 hover:bg-primary-bg/25 transition-all duration-150">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-primary-text pl-2">
                        {item.id}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-primary-text">
                        {item.creator}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-text font-normal">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-primary-text">
                        {item.amount}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-text font-normal">
                        {item.date}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap border",
                        isSuccess && "bg-green-500/10 text-green-500 border-green-500/20",
                        isWarning && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                        isError && "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {isSuccess && <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />}
                        {isWarning && <ClockIcon className="w-3.5 h-3.5 shrink-0" />}
                        {isError && <XCircleIcon className="w-3.5 h-3.5 shrink-0" />}
                        {item.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="bg-brand-primary hover:opacity-90 transition-all text-white px-3.5 py-1.5 rounded-md text-xs font-semibold border-none cursor-pointer"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
                (selectedLog.status?.toLowerCase() === "success") && "bg-green-500/10 text-green-500 border border-green-500/20",
                (selectedLog.status?.toLowerCase() === "warning" || selectedLog.status?.toLowerCase() === "pending") && "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
                (selectedLog.status?.toLowerCase() === "error" || selectedLog.status?.toLowerCase() === "failed") && "bg-red-500/10 text-red-500 border border-red-500/20"
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
