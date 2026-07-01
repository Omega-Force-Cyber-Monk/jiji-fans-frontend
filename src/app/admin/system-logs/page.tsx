"use client";
import React, { useMemo, useState } from "react";
import SystemOperationsLog from "@/components/admin/SystemOperationsLog";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { useGetSystemLogsQuery } from "@/redux/features/adminHome/adminHome.api";

const SystemLogsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [actorId, setActorId] = useState("");
  const [actionType, setActionType] = useState("");

  const { data: logsData, isLoading: isLogsLoading } = useGetSystemLogsQuery({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    actorId: actorId || undefined,
    actionType: actionType || undefined,
  });

  const transactions = useMemo(() => {
    const results = logsData?.data?.results || [];
    return results.map((log: any) => ({
      key: log._id,
      id: log._id ? log._id.substring(log._id.length - 8).toUpperCase() : "LOG",
      creator: log.actorId?.username || log.actorId?.name || "System",
      type: log.actionType || "System Action",
      amount: log.metadata?.amount ? `$${log.metadata.amount.toLocaleString()}` : "--",
      date: log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      }) : "N/A",
      status: ["success", "completed", "succeeded"].includes(log.status?.toLowerCase() || "")
        ? "success"
        : ["pending", "warning", "processing"].includes(log.status?.toLowerCase() || "")
          ? "warning"
          : "error",
      label: log.status || "Unknown",
    }));
  }, [logsData]);

  const totalResults = logsData?.data?.totalResults || 0;

  return (
    <div className="w-full space-y-6 pb-6">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-3">
        <AppBreadcrumb
          items={[
            { title: "Admin", href: "/admin/home" },
            { title: "System Logs" },
          ]}
        />
        <h2 className="text-2xl font-bold text-primary-text">
          System Logs ({totalResults})
        </h2>
      </div>

      {/* Re-usable Operations Log Table */}
      <SystemOperationsLog
        transactions={transactions}
        loading={isLogsLoading}
        searchVal={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        statusVal={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        actorIdVal={actorId}
        onActorIdChange={(val) => {
          setActorId(val);
          setPage(1);
        }}
        actionTypeVal={actionType}
        onActionTypeChange={(val) => {
          setActionType(val);
          setPage(1);
        }}
        page={page}
        pageSize={limit}
        total={totalResults}
        onPageChange={(p, s) => {
          setPage(p);
          setLimit(s);
        }}
        isDashboard={false}
      />
    </div>
  );
};

export default SystemLogsPage;
