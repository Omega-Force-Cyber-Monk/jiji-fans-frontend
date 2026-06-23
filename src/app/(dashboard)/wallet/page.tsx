"use client";

import React, { useState, useEffect, useRef } from "react";
import CPagination from "@/components/ui/CPagination";
import {
  Button,
  Alert,
  Empty,
  Form,
  FormProps,
  InputNumber,
  Skeleton,
  Table,
  TableColumnsType,
  Breadcrumb,
  Tabs,
  Card,
  Tag,
  Tooltip,
} from "antd";
import {
  useGetWalletStatsQuery,
  useGetWalletTransactionsQuery,
  TTransaction,
  TWithdrawalRequest,
  useMyWithdrawalRequestsQuery,
  useRequestWithdrawMutation,
} from "@/redux/features/wallet/wallet.api";
import { queryFormat } from "@/lib/helpers/queryFormat";
import GlobalModal from "@/components/GlobalModal";
import TextArea from "antd/es/input/TextArea";
import { errorAlert, TResError } from "@/lib/alerts";
import { TQuery, TUniObject } from "@/types";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { useGetPayoutForClientQuery } from "@/redux/features/transaction/transaction.api";
import { useGetProfileQuery } from "@/redux/features/users/users.api";
import { useGetMyKycStatusQuery } from "@/redux/features/kyc/userKYC/userKyc.api";
import { useRouter } from "next/navigation";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiDollarSign,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiActivity,
  FiDownload
} from "react-icons/fi";
import { cn } from "@/utils/cn";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";

const Page = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { messageApi } = useAppContext();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allTransactions, setAllTransactions] = useState<TTransaction[]>([]);
  const [withdrawalQuery, setWithdrawalQuery] = useState<TQuery>({
    page: 1,
    limit: 5,
  });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<TWithdrawalRequest | null>(null);
  const [withdrawalSubmitError, setWithdrawalSubmitError] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [submitRequest, { isLoading: requLoading }] = useRequestWithdrawMutation();
  const limit = 10;

  const { data: walletStats, isLoading: isLoadingStats } = useGetWalletStatsQuery();
  const { data: payoutStats } = useGetPayoutForClientQuery(undefined);
  const { data: kycStatusPayload, isLoading: isKycStatusLoading } = useGetMyKycStatusQuery(undefined);
  const { data: profileData } = useGetProfileQuery(undefined);

  const statusSource = (kycStatusPayload || {}) as TUniObject;
  const currentKycStatus = (
    statusSource?.status ||
    statusSource?.kycStatus ||
    statusSource?.data?.status ||
    statusSource?.data?.kycStatus ||
    profileData?.data?.kycStatus ||
    "NOT_SUBMITTED"
  )?.toString();

  const isKycCompleted = ["APPROVED", "COMPLETED", "VERIFIED"].includes(
    currentKycStatus?.toUpperCase(),
  );
  const minimumWithdrawalAmount = Number(
    payoutStats?.data?.minimum_threshold ?? payoutStats?.minimum_threshold ?? 0,
  );
  const canWithdrawByPayout = Boolean(payoutStats?.data?.isAvailable) || Boolean(payoutStats?.isAvailable);
  const isBelowMinimumThreshold =
    minimumWithdrawalAmount > 0 &&
    typeof walletStats?.balance === "number" &&
    walletStats.balance < minimumWithdrawalAmount;
  const disableWithdraw = !isKycCompleted || !canWithdrawByPayout || isBelowMinimumThreshold;

  const queryArgs = cursor
    ? [
      { name: "limit", value: String(limit) },
      { name: "cursor", value: cursor },
    ]
    : [{ name: "limit", value: String(limit) }];

  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetWalletTransactionsQuery(queryArgs);
  const {
    data: withdrawalData,
    isLoading: isLoadingWithdrawals,
    isError: isWithdrawalError,
  } = useMyWithdrawalRequestsQuery(queryFormat(withdrawalQuery));

  const pagination = transactionsData?.pagination;
  const withdrawalRequests = withdrawalData?.results || [];

  const transactionSkeletons = Array.from({ length: 5 });
  const withdrawalSkeletons = Array.from({ length: 5 });

  const showModal = () => {
    setWithdrawalSubmitError("");
    setOpenModal(true);
  };

  const onClose = () => {
    setOpenModal(false);
    form.resetFields();
    setWithdrawalSubmitError("");
  };

  const closeWithdrawalPreview = () => {
    setSelectedWithdrawal(null);
  };

  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    try {
      setWithdrawalSubmitError("");
      await submitRequest(values).unwrap();
      messageApi.open({
        key: "request",
        type: "success",
        content: "Withdraw request sent successfully!",
        duration: 3,
      });
      form.resetFields();
      setOpenModal(false);
    } catch (error) {
      const err = error as TResError & {
        data?: {
          message?: string;
          errorSources?: { path?: string; message?: string }[];
          data?: { message?: string; errorSources?: { path?: string; message?: string }[] };
        };
      };
      const payload = err?.data?.data ?? err?.data;
      const sourceErrors = payload?.errorSources || [];

      if (sourceErrors.length > 0) {
        form.setFields(
          sourceErrors
            .map((source) => {
              const fieldName = (source.path || "").replace(/^body\./, "").replace(/^files\./, "").trim();
              if (!["amount", "description"].includes(fieldName)) return null;
              return { name: [fieldName], errors: [source.message || "Invalid value"] };
            })
            .filter(Boolean) as Parameters<typeof form.setFields>[0],
        );
      }

      const fallbackMessage = payload?.message || err?.message || "Failed to submit withdrawal request";
      setWithdrawalSubmitError(fallbackMessage);
      errorAlert({ error: error as TResError, messageApi });
    }
  };

  useEffect(() => {
    if (transactionsData?.data) {
      setAllTransactions((prev) => {
        if (!cursor) return transactionsData.data;
        const newTransactions = transactionsData.data.filter(
          (transaction) => !prev.some((p) => p._id === transaction._id),
        );
        return [...prev, ...newTransactions];
      });
    }
  }, [transactionsData, cursor]);

  useEffect(() => {
    if (!pagination?.hasNextPage) return;

    const option = { root: null, rootMargin: "40px", threshold: 0.1 };
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && pagination?.hasNextPage && !isLoadingTransactions && !isLoadingMore) {
        setIsLoadingMore(true);
        if (pagination.nextCursor) setCursor(pagination.nextCursor);
        setTimeout(() => setIsLoadingMore(false), 1000);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);
    const timeoutId = setTimeout(() => {
      if (loadMoreRef.current) observerRef.current?.observe(loadMoreRef.current);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [pagination?.hasNextPage, pagination?.nextCursor, isLoadingTransactions, isLoadingMore]);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "PENDING": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "FAILED": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getStatusTag = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED": return <Tag color="success" className="font-semibold px-2.5 py-0.5 rounded-md">COMPLETED</Tag>;
      case "PENDING": return <Tag color="processing" className="font-semibold px-2.5 py-0.5 rounded-md">PENDING</Tag>;
      case "FAILED": return <Tag color="error" className="font-semibold px-2.5 py-0.5 rounded-md">FAILED</Tag>;
      default: return <Tag className="font-semibold px-2.5 py-0.5 rounded-md">{status?.toUpperCase()}</Tag>;
    }
  };

  const getTypeColor = (type: string) => {
    const upper = (type || "").toUpperCase();
    if (upper.includes("WITHDRAW") || upper.includes("PAYOUT") || upper.includes("FEE")) return "text-red-400";
    return "text-brand-primary";
  };

  const formatTypeLabel = (type: string) => {
    return (type || "Transactions").toLowerCase().split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  };

  const isDebitType = (type: string) => {
    const upper = (type || "").toUpperCase();
    if (upper === "SUBSCRIPTION_FEE") return false;
    return upper.includes("WITHDRAW") || upper.includes("FEE") || upper.includes("PAYOUT");
  };

  const withdrawalColumns: TableColumnsType<TWithdrawalRequest> = [
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount: number) => <span className="font-semibold text-primary-text text-sm">{formatCurrency(amount, walletStats?.currency || "USD")}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (description: string) => (
        <Tooltip title={description}>
          <span className="truncate max-w-[240px] inline-block text-secondary-text text-sm pt-1">
            {description || "No description"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Requested At",
      dataIndex: "createdAt",
      render: (date: string) => <span className="text-muted-text text-sm">{new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>,
    },
    {
      title: "Action",
      align: "right",
      render: (_, record) => (
        <Button size="small" type="primary" ghost className="text-sm border-brand-primary/30 text-brand-primary hover:border-brand-primary rounded-md" onClick={() => setSelectedWithdrawal(record)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full max-w-none space-y-8 animate-fade-in">

      {/* 1. Header Navigation Context Block */}
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
          <AppBreadcrumb
            items={[{ title: "Home", href: "/overview" }, { title: "Wallet & Finance" }]}
            className="text-sm font-medium"
          />
          {/* <h2 className="text-2xl lg:text-3xl font-bold text-primary-text">Wallet Overview</h2> */}
        </div>
      </div>

      {/* 2. Unified Grid Workspaces (Full Width Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Wallet Financial Asset Hub Card (2/3 Width) */}
        <div className="lg:col-span-2 h-full">
          {isLoadingStats ? (
            <Card className="bg-secondary-bg! border-border-primary! h-[250px] rounded-lg flex flex-col justify-center p-6">
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ) : walletStats ? (
            <div className="relative group rounded-lg border border-border-primary p-6 lg:p-7 bg-secondary-bg text-primary-text transition-all duration-300 overflow-hidden h-full">
              {/* Soft ambient glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                {/* <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-2xl rounded-full"></div> */}
              </div>

              {/* Header */}
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-muted-text text-sm uppercase tracking-wider">
                    <FiCreditCard className="text-brand-primary w-4 h-4" />
                    <span>Creator Balance</span>
                  </div>

                  <h3 className="mt-2 text-3xl lg:text-4xl font-semibold text-primary-text tracking-tight">
                    {formatCurrency(walletStats.balance, walletStats.currency || "USD")}
                  </h3>
                </div>

                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-brand-primary/10 border border-brand-primary/20">
                  <FiActivity className="w-5 h-5 text-brand-primary animate-pulse" />
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-border-primary/60"></div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 relative z-10">

                <button
                  disabled={disableWithdraw}
                  onClick={showModal}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-black font-semibold px-5 py-3 rounded-md hover:bg-brand-primary/90 disabled:opacity-40 transition-all active:scale-[0.97]"
                >
                  <FiDownload className="w-4 h-4" />
                  Withdraw Funds
                </button>

                {!isKycCompleted && !isKycStatusLoading && (
                  <button
                    onClick={() => router.push("/verification")}
                    className="flex-1 px-5 py-3 rounded-md border border-border-primary bg-transparent text-sm text-secondary-text hover:text-primary-text hover:bg-secondary-bg hover:border-brand-primary transition-all"
                  >
                    Complete KYC
                  </button>
                )}
              </div>

            </div>
          ) : (
            <Card className="bg-secondary-bg! border-border-primary! h-[250px] rounded-lg flex items-center justify-center">
              <Empty description="Failed to load account assets" />
            </Card>
          )}
        </div>

        {/* Right System Operational Status Check Panel (1/3 Width) */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 shadow-sm h-[250px] flex flex-col justify-center space-y-4 hover:border-brand-primary/20 transition-all duration-300">
            <h4 className="text-xl font-semibold text-muted-text">Account Diagnostic Clearance</h4>

            <div className="space-y-3.5">
              {/* KYC Clearance Check */}
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="bg-primary-bg p-1.5 rounded-md border border-border-primary shrink-0">
                    {isKycCompleted ? <FiCheckCircle className="text-success w-5 h-5" /> : <FiAlertCircle className="text-amber-500 w-5 h-5" />}
                  </div>
                  <span className="text-base font-medium text-secondary-text truncate">Identity Verification KYC</span>
                </div>
                <span className={cn("px-4 py-1.5 rounded-md text-sm capitalize tracking-wide shrink-0", isKycCompleted ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-500")}>
                  {currentKycStatus?.toLowerCase() || "Not Submitted"}
                </span>
              </div>

              {/* Payout Processing Windows */}
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="bg-primary-bg p-1.5 rounded-md border border-border-primary shrink-0">
                    {canWithdrawByPayout ? <FiCheckCircle className="text-success w-5 h-5" /> : <FiClock className="text-indigo-400 w-5 h-5" />}
                  </div>
                  <span className="text-base font-medium text-secondary-text truncate">Platform Payout Gate</span>
                </div>
                <span className={cn("px-4 py-1.5 rounded-md font-medium tracking-wide shrink-0", canWithdrawByPayout ? "bg-success/10 text-success" : "bg-indigo-500/10 text-indigo-400")}>
                  {canWithdrawByPayout ? "Active Open" : "Closed"}
                </span>
              </div>

              {/* Absolute Minimum Bound Limit Parameters */}
              {minimumWithdrawalAmount > 0 && (
                <div className="flex items-center justify-between gap-4 text-sm border-t border-border-primary/60 pt-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="bg-primary-bg p-1.5 rounded-md border border-border-primary shrink-0">
                      <FiDollarSign className="text-muted-text w-5 h-5" />
                    </div>
                    <span className="text-base font-medium text-secondary-text truncate">Minimum Threshold Requirement</span>
                  </div>
                  <span className={cn("font-medium text-sm shrink-0", isBelowMinimumThreshold ? "text-red-400" : "text-primary-text")}>
                    {formatCurrency(minimumWithdrawalAmount, walletStats?.currency || "USD")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Comprehensive Full-Width Ledger Panels View */}
      <div className="bg-secondary-bg border border-border-primary rounded-lg shadow-sm overflow-hidden">
        <Tabs
          defaultActiveKey="1"
          className="px-2 pt-2 text-primary-text"
          items={[
            {
              key: '1',
              label: <span className="text-base px-4 pb-2 block text-primary-text font-medium">All Ledger Transactions</span>,
              children: (
                <div className="pb-4 px-4 lg:px-6">
                  {isLoadingTransactions && !cursor ? (
                    <div className="space-y-4 py-4">
                      {transactionSkeletons.map((_, i) => (
                        <Skeleton key={`tx-sk-${i}`} avatar active paragraph={{ rows: 1 }} className="dark:opacity-20" />
                      ))}
                    </div>
                  ) : allTransactions.length === 0 ? (
                    <div className="py-16 flex items-center justify-center">
                      <Empty description={<span className="text-muted-text">No transaction history logged on this wallet.</span>} />
                    </div>
                  ) : (
                    <div className="divide-y divide-border-primary/30">
                      {allTransactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between py-4.5 hover:bg-primary-bg/20 dark:hover:bg-white/5 px-2 rounded-md transition-colors gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={cn(
                              "w-10 h-10 rounded-md flex items-center justify-center shrink-0 border",
                              isDebitType(transaction.type) ? 'bg-red-500/5 text-red-400 border-red-500/10' : 'bg-green-500/5 text-brand-primary border-green-500/10'
                            )}>
                              {isDebitType(transaction.type) ? <FiArrowUpRight size={18} /> : <FiArrowDownLeft size={18} />}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-semibold text-primary-text text-sm truncate max-w-[320px] lg:max-w-xl">
                                {transaction.description || transaction.referenceModel || "Wallet Transaction"}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-text">
                                <span>{new Date(transaction.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-border-primary/60">•</span>
                                <span className="truncate max-w-[120px] font-mono opacity-80 text-secondary-text">ID: {transaction.referenceId || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 space-y-1">
                            <p className={cn("font-bold text-base tracking-tight", getTypeColor(transaction.type))}>
                              {isDebitType(transaction.type) ? "-" : "+"}
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                            <div className="flex items-center justify-end gap-1.5">
                              <span className={cn("px-1.5 py-0.5 rounded-sm font-bold tracking-wider uppercase", getStatusColor(transaction.status))}>
                                {transaction.status}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-sm text-sm font-semibold tracking-wider uppercase bg-primary-bg border border-border-primary text-secondary-text">
                                {formatTypeLabel(transaction.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Infinite Scroll Target Trigger Footers */}
                      {pagination?.hasNextPage && (
                        <div ref={loadMoreRef} className="w-full py-6 flex justify-center border-t border-border-primary/10">
                          {isLoadingMore ? (
                            <Skeleton.Input active size="small" style={{ width: 100 }} className="dark:opacity-20" />
                          ) : (
                            <span className="text-sm text-muted-text font-medium tracking-wide">Scroll down to load more rows</span>
                          )}
                        </div>
                      )}
                      {!pagination?.hasNextPage && allTransactions.length > 0 && (
                        <div className="w-full py-6 flex justify-center border-t border-border-primary/10">
                          <p className="text-sm text-muted-text font-medium">Finished parsing transaction history</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: '2',
              label: <span className="text-base px-4 pb-2 block text-primary-text font-medium">Withdrawal Action Records</span>,
              children: (
                <div className="pb-4 px-4 lg:px-6">
                  {isLoadingWithdrawals ? (
                    <div className="space-y-4 py-4">
                      {withdrawalSkeletons.map((_, i) => (
                        <Skeleton key={`wd-sk-${i}`} active paragraph={{ rows: 1 }} className="dark:opacity-20" />
                      ))}
                    </div>
                  ) : isWithdrawalError ? (
                    <div className="py-12 flex justify-center">
                      <Empty description={<span className="text-muted-text">System failed to fetch settlement archives.</span>} />
                    </div>
                  ) : withdrawalRequests.length === 0 ? (
                    <div className="py-12 flex justify-center">
                      <Empty description={<span className="text-muted-text">No withdrawal settlements logged on this profile.</span>} />
                    </div>
                  ) : (
                    <div className="w-full space-y-4">
                      <div className="w-full overflow-x-auto no-scrollbar">
                        <Table
                          columns={withdrawalColumns}
                          dataSource={withdrawalRequests}
                          pagination={false}
                          rowKey="_id"
                          className="bg-transparent"
                        />
                      </div>
                      <div className="pt-2 flex justify-end">
                        <CPagination
                          setQuery={setWithdrawalQuery}
                          query={withdrawalQuery}
                          totalData={withdrawalData?.totalResults}
                          showSizeChanger={false}
                          showQuickJumper={false}
                          customNavigation={false}
                          size="default"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </div>

      {/* 4. Withdrawal Preview Profile Details Modal Overlay */}
      <GlobalModal
        isModalOpen={Boolean(selectedWithdrawal)}
        setIsModalOpen={(open) => { if (!open) setSelectedWithdrawal(null); }}
        onClose={closeWithdrawalPreview}
        maxWidth="450px"
      >
        <div className="w-full p-5 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary-text">Settlement Parameters</h3>
            <p className="text-sm text-muted-text mt-1">Detailed operational records for current request context</p>
          </div>

          <div className="space-y-3.5 rounded-md bg-primary-bg/30 p-4 border border-border-primary/60 text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-border-primary/20">
              <span className="font-medium text-secondary-text">Disbursement Valuation</span>
              <span className="text-base font-bold text-primary-text">
                {selectedWithdrawal ? formatCurrency(selectedWithdrawal.amount, walletStats?.currency || "USD") : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-border-primary/20">
              <span className="font-medium text-secondary-text">Current Settlement Status</span>
              <div>{selectedWithdrawal?.status ? getStatusTag(selectedWithdrawal.status) : "-"}</div>
            </div>
            <div className="flex justify-between items-start pb-2.5 border-b border-border-primary/20 gap-4">
              <span className="font-medium text-secondary-text shrink-0 mt-0.5">Reference Note Context</span>
              <span className="text-primary-text font-medium text-right break-words max-w-[200px]">
                {selectedWithdrawal?.description || "No context declaration entered."}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-secondary-text">System Submission Log</span>
              <span className="text-primary-text font-medium">
                {selectedWithdrawal?.createdAt ? new Date(selectedWithdrawal.createdAt).toLocaleString() : "-"}
              </span>
            </div>

            {selectedWithdrawal?.status === "rejected" && (
              <div className="mt-3.5 rounded-md border border-red-500/20 bg-red-500/5 p-3.5 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-red-400">System Rejection Log Report</p>
                <div className="space-y-1.5 text-sm">
                  <p className="text-muted-text">Reason Parameter:</p>
                  <p className="font-medium text-primary-text leading-normal bg-primary-bg p-2 rounded border border-border-primary/40">
                    {selectedWithdrawal.rejectReason || "No root failure string provided by administrator paths."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button onClick={closeWithdrawalPreview} className="w-full py-2.5 rounded-md bg-primary-bg border border-border-primary text-sm font-semibold text-primary-text hover:border-brand-primary/40 active:scale-[0.99] transition-all cursor-pointer">
            Dismiss Frame
          </button>
        </div>
      </GlobalModal>

      {/* 5. Create / Submit New Withdrawal Request Modal Overlay */}
      <GlobalModal
        isModalOpen={openModal}
        setIsModalOpen={setOpenModal}
        onClose={onClose}
        maxWidth="450px"
      >
        <div className="w-full p-5">
          <div className="mb-5 text-center space-y-1">
            <h3 className="text-xl font-bold text-primary-text">Request Disbursal</h3>
            <p className="text-sm text-muted-text">Declare financial volume targets to securely route assets</p>
          </div>

          <Form
            form={form}
            name="withdrawal_form"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            {withdrawalSubmitError && (
              <Alert
                type="error"
                showIcon
                message="Disbursal Rejection Fault"
                description={withdrawalSubmitError}
                className="mb-5 rounded-md bg-red-500/5 border-red-500/10 text-sm"
              />
            )}

            <Form.Item
              label={<span className="text-sm font-semibold text-secondary-text">Withdrawal Volume Value</span>}
              name="amount"
              rules={[
                { required: true, message: "Required input criteria missing." },
                {
                  validator: (_, value) => {
                    if (value == null) return Promise.resolve();
                    if (minimumWithdrawalAmount > 0 && value < minimumWithdrawalAmount) {
                      return Promise.reject(new Error(`Value bounds drop beneath ${formatCurrency(minimumWithdrawalAmount, walletStats?.currency || "USD")}`));
                    }
                    if (typeof walletStats?.balance === "number" && value > walletStats.balance) {
                      return Promise.reject(new Error("Declared value breaks available asset parameter limits."));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                prefix={<FiDollarSign className="text-muted-text mr-1 text-sm" />}
                placeholder="0.00"
                style={{ width: "100%" }}
                size="large"
                className="rounded-md bg-primary-bg/50 border-border-primary text-primary-text text-sm h-11 pt-1.5"
                precision={2}
                step={1}
                min={minimumWithdrawalAmount > 0 ? minimumWithdrawalAmount : 1}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-semibold text-secondary-text">Operational Description Statement (Optional)</span>}
              name="description"
              className="mt-4"
            >
              <TextArea
                showCount
                rows={3}
                maxLength={200}
                placeholder="Attach transactional processing logs or structural tracking references here..."
                className="rounded-md bg-primary-bg/50 border-border-primary text-primary-text text-sm p-3 placeholder:text-muted-text/60"
              />
            </Form.Item>

            <button
              type="submit"
              disabled={requLoading}
              className="w-full mt-6 inline-flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 text-black font-semibold h-11 rounded-md transition-all shadow-sm shadow-brand-primary/5 cursor-pointer disabled:opacity-40"
            >
              {requLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "Deploy Request Pipeline"
              )}
            </button>
          </Form>
        </div>
      </GlobalModal>
    </div>
  );
};

export default Page;