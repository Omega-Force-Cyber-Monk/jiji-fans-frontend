"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { errorAlert } from "@/lib/alerts";
import { useGetProfileQuery } from "@/redux/features/users/users.api";
import {
  useGetMyKycStatusQuery,
  useVerifyKycMutation,
  useStartKycMutation,
  useSyncKycStatusMutation,
} from "@/redux/features/kyc/userKYC/userKyc.api";
import GlobalModal from "@/components/GlobalModal";
import KycVerification from "@/components/shared/KycVerification";
import KybVerification from "@/components/shared/KybVerification";
import {
  FiUser,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiFileText,
  FiBriefcase,
} from "react-icons/fi";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";
import { Skeleton } from "antd";
import { TUniObject } from "@/types";

type VerificationType = "KYC" | "KYB";

// Status badge helper
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toUpperCase();
  const map: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    APPROVED: { icon: <FiCheckCircle className="w-3 h-3" />, color: "text-success", bg: "bg-success/10 border-success/20", label: "Approved" },
    COMPLETED: { icon: <FiCheckCircle className="w-3 h-3" />, color: "text-success", bg: "bg-success/10 border-success/20", label: "Completed" },
    PENDING: { icon: <FiClock className="w-3 h-3" />, color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Under Review" },
    REJECTED: { icon: <FiXCircle className="w-3 h-3" />, color: "text-error", bg: "bg-error/10 border-error/20", label: "Rejected" },
    NOT_SUBMITTED: { icon: <FiAlertCircle className="w-3 h-3" />, color: "text-muted-text", bg: "bg-secondary-bg border border-border-primary", label: "Not Submitted" },
  };
  const cfg = map[s] || map["NOT_SUBMITTED"];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const VerificationForm: React.FC = () => {
  const router = useRouter();
  const { messageApi } = useAppContext();
  const formRef = useRef<HTMLDivElement>(null);

  const [kycToken, setKycToken] = useState<string | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kybToken, setKybToken] = useState<string | null>(null);
  const [isKybModalOpen, setIsKybModalOpen] = useState(false);

  const [uploadMu, { isLoading: isStartingRequest }] = useVerifyKycMutation();
  const [startKyc, { isLoading: isFetchingToken }] = useStartKycMutation();
  const [syncKyc, { isLoading: isSyncing }] = useSyncKycStatusMutation();
  
  const { data: kycStatusPayload, isLoading: isLoadingKycStatus } = useGetMyKycStatusQuery(undefined);
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery(undefined);

  const isPageLoading = isLoadingKycStatus || isLoadingProfile;
  const statusSource = (kycStatusPayload || {}) as TUniObject;
  const currentKycStatus = (
    statusSource?.status ||
    statusSource?.kycStatus ||
    statusSource?.data?.status ||
    statusSource?.data?.kycStatus ||
    profileData?.data?.kycStatus ||
    "NOT_SUBMITTED"
  )?.toString();

  const pendingRequestType = statusSource?.latestRequest?.type || statusSource?.data?.latestRequest?.type;

  useEffect(() => {
    if (currentKycStatus === "PENDING") {
      syncKyc().unwrap().catch(() => {});
    }
  }, [currentKycStatus, syncKyc]);

  const fetchTokenAndOpenModal = async (type: VerificationType) => {
    try {
      const res = await startKyc().unwrap();
      const token = res?.data?.token || res?.token;
      if (token) {
        if (type === "KYC") {
          setKycToken(token);
          setIsKycModalOpen(true);
        } else {
          setKybToken(token);
          setIsKybModalOpen(true);
        }
        messageApi.success("Verification module loaded");
      } else {
        throw new Error("Failed to retrieve verification token");
      }
    } catch (error) {
      errorAlert({ error, messageApi });
    }
  };

  const handleStartVerification = async (type: VerificationType, isRestart = false) => {
    try {
      // If it's a new request or a restart, we call the request endpoint to set the correct type
      if (isRestart || currentKycStatus === "NOT_SUBMITTED" || currentKycStatus === "REJECTED") {
        await uploadMu({ type, note: `Starting ${type === "KYC" ? "individual" : "business"} verification` }).unwrap();
      }
      
      // Fetch token and open the SDK widget
      await fetchTokenAndOpenModal(type);
    } catch (error) {
      errorAlert({ error, messageApi });
    }
  };

  const handleResumeVerification = async () => {
    // Determine the type from the pending request, default to KYC
    const type = pendingRequestType || "KYC";
    await fetchTokenAndOpenModal(type as VerificationType);
  };

  const handleSuccess = () => {
    messageApi.success("Verification completed successfully!");
    setIsKycModalOpen(false);
    setIsKybModalOpen(false);
    syncKyc().unwrap().catch(() => {});
  };

  const handleSyncKycStatus = async () => {
    try {
      await syncKyc().unwrap();
      messageApi.success("KYC status synchronized successfully");
    } catch (error) {
      errorAlert({ error, messageApi });
    }
  };

  const isProcessing = isStartingRequest || isFetchingToken;

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="space-y-6 pt-4">
        <AppBreadcrumb
          items={[{ title: "Home", href: "/overview" }, { title: "Verification", href: "/verification" }, { title: "Identity Verification" }]}
          className="text-xs text-muted-text"
        />
      </div>

      {isPageLoading ? (
        <div className="space-y-6">
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-4 space-y-4 animate-pulse">
            <Skeleton active paragraph={{ rows: 2 }} />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton.Input active style={{ width: "100%", height: 80 }} className="rounded-md" />
              <Skeleton.Input active style={{ width: "100%", height: 80 }} className="rounded-md" />
            </div>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      ) : (
        <>
          <div className="bg-secondary-bg border border-border-primary rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-primary-bg border border-border-primary flex items-center justify-center shrink-0">
                <FiShield className="w-6 h-6 text-brand-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-text uppercase tracking-wider">Verification Clearance Status</p>
                <div>
                  <StatusBadge status={currentKycStatus} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Select Verification Model", desc: "Select individual creator status (KYC) or registered corporate status (KYB)", icon: <FiUser className="w-6 h-6" /> },
              { step: "02", title: "Provide Official Credentials", desc: "Input legal names, registry identifiers, and administrative dates", icon: <FiFileText className="w-6 h-6" /> },
              { step: "03", title: "Secure Security Clearance", desc: "Upload high-resolution credential evidence to clear audit verification gates", icon: <FiShield className="w-6 h-6" /> },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-secondary-bg border border-border-primary transition-all duration-300 hover:border-brand-primary/20">
                <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-text uppercase tracking-widest">{item.step}</p>
                  <p className="text-base font-semibold text-primary-text mt-1.5">{item.title}</p>
                  <p className="text-sm text-secondary-text mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {["NOT_SUBMITTED", "REJECTED", "PENDING"].includes(currentKycStatus.toUpperCase()) ? (
            <div ref={formRef} className="bg-secondary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-4 border-b border-border-primary">
                <h2 className="text-xl font-semibold text-primary-text">Verification Clearance Form</h2>
                <p className="text-base text-secondary-text mt-1.5">All administrative records are securely encrypted and verified through Sumsub.</p>
              </div>

              <div className="p-4 md:p-6">
                {currentKycStatus === "REJECTED" && (
                  <div className="bg-error/5 border border-error/25 p-5 rounded-lg flex items-start gap-4 mb-6">
                    <FiXCircle className="w-6 h-6 text-error shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-left">
                      <h5 className="font-semibold text-error text-base">Previous Verification Attempt Rejected</h5>
                      {(statusSource?.kycRejectedReason || statusSource?.latestRequest?.rejectionReason) && (
                        <p className="text-sm text-secondary-text mt-1">
                          <strong className="text-primary-text font-semibold">Reason:</strong> {statusSource?.kycRejectedReason || statusSource?.latestRequest?.rejectionReason}
                        </p>
                      )}
                      {(statusSource?.kycAdjustmentNote || statusSource?.latestRequest?.adjustmentNote) && (
                        <p className="text-sm text-secondary-text">
                          <strong className="text-primary-text font-semibold">Adjustment Note:</strong> {statusSource?.kycAdjustmentNote || statusSource?.latestRequest?.adjustmentNote}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {currentKycStatus === "PENDING" && (
                  <div className="bg-warning/5 border border-warning/25 p-5 rounded-lg flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <div className="flex items-start gap-4">
                      <FiClock className="w-6 h-6 text-warning shrink-0 mt-0.5" />
                      <div className="space-y-1.5 text-left">
                        <h5 className="font-semibold text-warning text-base">Verification In Progress</h5>
                        <p className="text-sm text-secondary-text mt-1">
                          You have an incomplete or pending verification. You can resume your session, or sync status if you recently finished.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleResumeVerification}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-md bg-brand-primary text-black font-semibold hover:opacity-90 transition-all text-sm disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessing ? "Loading..." : "Resume Verification"}
                      </button>
                      <button
                        onClick={handleSyncKycStatus}
                        disabled={isSyncing}
                        className="px-4 py-2 rounded-md border border-border-primary bg-primary-bg text-primary-text font-semibold hover:bg-secondary-bg transition-all text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FiClock className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                        Sync
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-wider text-muted-text">Step 1 — Select Verification Type</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {([
                      {
                        value: "KYC" as VerificationType,
                        icon: <FiUser className="w-5 h-5" />,
                        label: "Individual Identity Verification (KYC)",
                        sub: "For personal accounts — Verify your official identity using a Government-issued ID card, international passport, or driving license.",
                        tag: "Recommended for Creators",
                        tagColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
                        iconBg: "bg-brand-primary/10 text-brand-primary",
                      },
                      {
                        value: "KYB" as VerificationType,
                        icon: <FiBriefcase className="w-5 h-5" />,
                        label: "Corporate Business Verification (KYB)",
                        sub: "For companies, agencies, and organisations — Validate corporate legitimacy using registration certificate and administrative documents.",
                        tag: "For Agencies & Companies",
                        tagColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
                        iconBg: "bg-brand-primary/10 text-brand-primary",
                      },
                    ] as const).map((opt) => (
                      <div
                        key={opt.value}
                        className={`relative flex items-start gap-4 p-4 rounded-md border text-left transition-all border-border-primary bg-secondary-bg`}
                      >
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                          {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-primary-text">{opt.label}</p>
                          <p className="text-sm text-secondary-text mt-2 leading-relaxed">{opt.sub}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-4 w-full">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartVerification(opt.value, currentKycStatus === "PENDING");
                              }}
                              disabled={isProcessing}
                              className="px-4 py-2 rounded-md bg-brand-primary text-black text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-brand-primary/20 flex items-center justify-center shrink-0 text-white disabled:opacity-50 cursor-pointer"
                            >
                              {currentKycStatus === "PENDING" ? `Restart as ${opt.value}` : `Start ${opt.value}`}
                            </button>
                            <span className={`inline-block text-xs font-medium px-3 py-1.5 rounded-sm border ${opt.tagColor}`}>
                              {opt.tag}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 mt-6 rounded-md bg-brand-primary/5 border border-brand-primary/20">
                  <FiShield className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-secondary-text leading-relaxed">
                    Your identification papers are protected via <strong className="text-primary-text font-semibold">end-to-end industry standard encryption</strong> and checked by compliance administrators within <strong className="text-primary-text font-semibold">1–3 business days</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-8 text-center space-y-4">
              <FiShield className="w-10 h-10 text-brand-primary mx-auto" />
              <h2 className="text-xl font-semibold text-success">Verification Completed Successfully!</h2>
              <p className="text-base text-secondary-text max-w-md mx-auto">
                Congratulations! Your identity has been successfully verified and you have been granted clearance. You now have full access to all verified features.
              </p>
            </div>
          )}
        </>
      )}

      <GlobalModal
        isModalOpen={isKycModalOpen}
        setIsModalOpen={setIsKycModalOpen}
        maxWidth="800px"
      >
        <KycVerification
          userEmail={profileData?.data?.email || ""}
          token={kycToken || ""}
          onSuccess={handleSuccess}
        />
      </GlobalModal>

      <GlobalModal
        isModalOpen={isKybModalOpen}
        setIsModalOpen={setIsKybModalOpen}
        maxWidth="800px"
      >
        <KybVerification
          userEmail={profileData?.data?.email || ""}
          token={kybToken || ""}
          onSuccess={handleSuccess}
        />
      </GlobalModal>
    </div>
  );
};

export default VerificationForm;
