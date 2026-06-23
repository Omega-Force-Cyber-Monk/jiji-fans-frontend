"use client";
import React, { useEffect, useRef, useState } from "react";
import { Form, Input, DatePicker, Button, Upload, Skeleton } from "antd";
import type { FormProps, UploadProps } from "antd";
import { useRouter } from "next/navigation";
import { TUniObject } from "@/types";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { applyApiErrorToForm, errorAlert } from "@/lib/alerts";
import {
  useGetProfileQuery,
} from "@/redux/features/users/users.api";
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
  extractFileFromUploadValue,
  RESOURCE_PURPOSE,
  uploadResource,
} from "@/lib/resources/uploadResource";
import {
  FiUser,
  FiShield,
  FiUploadCloud,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiExternalLink,
  FiFileText,
  FiBriefcase,
} from "react-icons/fi";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";

const { TextArea } = Input;
type VerificationType = "KYC" | "KYB";

const KYC_RESOURCE_FIELDS = [
  "proofOfIdentityResourceId",
  "proofOfAddressResourceId",
  "selfieResourceId",
] as const;

const KYB_RESOURCE_FIELDS = [
  "certificationOfIncorporationResourceId",
  "businessRegistrationDocumentResourceId",
  "shareHoldingDocumentResourceId",
  "proofOfBusinessAddressResourceId",
  "businessAccountStatementResourceId",
] as const;

const uploadProps: UploadProps = {
  beforeUpload: () => false,
  maxCount: 1,
  accept: "image/*,.pdf",
};

// Reusable upload zone component with preview and options
const UploadZone: React.FC<{
  name: string[];
  label: string;
  hint: string;
  required?: boolean;
  icon?: React.ReactNode;
  form: any;
}> = ({ name, label, hint, required = true, icon, form }) => {
  const [preview, setPreview] = useState<{ url: string; isPdf: boolean; name: string } | null>(null);

  const handleOnChange = (info: any) => {
    const file = info.file;
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.status === "removed") {
      setPreview(null);
      form.setFieldValue(name, null);
      return;
    }

    const originFile = file.originFileObj || file;
    if (originFile instanceof File) {
      const isPdf = originFile.type === "application/pdf" || originFile.name.endsWith(".pdf");
      const url = URL.createObjectURL(originFile);
      setPreview({
        url,
        isPdf,
        name: originFile.name,
      });
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    form.setFieldValue(name, null);
  };

  return (
    <div className="w-full h-56 block">
      <Form.Item
        name={name}
        valuePropName="file"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) return e[0];
          return e?.file;
        }}
        rules={required ? [{ required: true, message: `Please upload ${label.toLowerCase()}` }] : []}
        className="mb-0 w-full h-full [&_.ant-form-item-row]:w-full [&_.ant-form-item-row]:h-full [&_.ant-form-item-control]:w-full [&_.ant-form-item-control]:h-full [&_.ant-form-item-control-input]:w-full [&_.ant-form-item-control-input]:h-full [&_.ant-form-item-control-input-content]:w-full [&_.ant-form-item-control-input-content]:h-full"
      >
        {!preview ? (
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*,.pdf"
            showUploadList={false}
            fileList={[]}
            onChange={handleOnChange}
            className="w-full h-full block [&_.ant-upload-wrapper]:w-full [&_.ant-upload-wrapper]:h-full [&_.ant-upload]:!w-full [&_.ant-upload]:!h-full [&_.ant-upload-select]:!w-full [&_.ant-upload-select]:!h-full [&_.ant-upload-select]:!block"
          >
            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-dashed border-border-primary hover:border-brand-primary bg-secondary-bg hover:bg-brand-primary/5 transition-all cursor-pointer w-full h-56">
              <div className="w-10 h-10 rounded-md bg-primary-bg border border-border-primary flex items-center justify-center transition-colors">
                {icon || <FiUploadCloud className="w-5 h-5 text-secondary-text" />}
              </div>
              <div className="text-center mt-2 w-full">
                <p className="text-sm font-medium text-primary-text truncate px-2">{label}</p>
                <p className="text-xs text-muted-text mt-1.5 truncate px-2">{hint}</p>
              </div>
            </div>
          </Upload>
        ) : (
          <div className="relative w-full h-56 rounded-md border border-border-primary overflow-hidden group bg-primary-bg">
            {/* Full Box Preview */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden p-2">
              {preview.isPdf ? (
                <iframe src={`${preview.url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-none pointer-events-none rounded-sm bg-white" title="PDF Preview" />
              ) : (
                <img src={preview.url} alt={label} className="w-full h-full object-contain rounded-sm" />
              )}
            </div>

            {/* Hover action overlay */}
            <div className="absolute inset-0 bg-secondary-bg/95 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center gap-3 p-4 z-10">
              <div className="text-center w-full px-2">
                <p className="text-sm font-medium text-primary-text truncate">{label}</p>
                <p className="text-xs text-success mt-1 truncate">
                  {preview.isPdf ? preview.name : "Uploaded successfully"}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full mt-2">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-bg border border-border-primary text-secondary-text font-medium py-2 rounded-md hover:text-primary-text hover:border-brand-primary text-xs transition-colors"
                >
                  <FiExternalLink className="w-3 h-3" />
                  View
                </a>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex-1 flex items-center justify-center gap-2 bg-error/10 text-error font-medium py-2 rounded-md hover:bg-error/20 text-xs transition-colors"
                >
                  <FiXCircle className="w-3 h-3" />
                  Change
                </button>
              </div>
            </div>
          </div>
        )}
      </Form.Item>
    </div>
  );
};

// Status badge helper aligned with design guidelines
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
  const [form] = Form.useForm();
  const [type, setType] = useState<VerificationType | null>("KYC");
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [kycToken, setKycToken] = useState<string | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kybToken, setKybToken] = useState<string | null>(null);
  const [isKybModalOpen, setIsKybModalOpen] = useState(false);

  useEffect(() => {
    form.setFieldValue("type", "KYC");
  }, [form]);

  const [uploadMu, { isLoading }] = useVerifyKycMutation();
  const [startKyc, { isLoading: isStartingKyc }] = useStartKycMutation();
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

  // Background status sync on page load/mount if status is PENDING
  useEffect(() => {
    if (currentKycStatus === "PENDING") {
      syncKyc()
        .unwrap()
        .then((res) => {
          console.log("Auto sync response:", res);
        })
        .catch((error) => {
          console.error("Auto sync failed:", error);
        });
    }
  }, [currentKycStatus, syncKyc]);

  const handleStartKyc = async () => {
    try {
      const res = await startKyc().unwrap();
      console.log("Start KYC response:", res);
      const token = res?.data?.token || res?.token;
      if (token) {
        setKycToken(token);
        setIsKycModalOpen(true);
        messageApi.success("Verification module loaded");
      } else {
        throw new Error("Failed to retrieve verification token");
      }
    } catch (error) {
      errorAlert({ error, messageApi });
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKycSuccess = () => {
    messageApi.success("Verification completed successfully!");
    setIsKycModalOpen(false);
  };

  const handleStartKyb = async () => {
    try {
      const res = await startKyc().unwrap();
      console.log("Start KYB response:", res);
      const token = res?.data?.token || res?.token;
      if (token) {
        setKybToken(token);
        setIsKybModalOpen(true);
        messageApi.success("Verification module loaded");
      } else {
        throw new Error("Failed to retrieve verification token");
      }
    } catch (error) {
      errorAlert({ error, messageApi });
    }
  };

  const handleKybSuccess = () => {
    messageApi.success("Business verification completed successfully!");
    setIsKybModalOpen(false);
  };

  const handleSyncKycStatus = async () => {
    try {
      const res = await syncKyc().unwrap();
      messageApi.success("KYC status synchronized successfully");
      console.log("Manual KYC status sync response:", res);
    } catch (error) {
      errorAlert({ error, messageApi });
    }
  };

  const handleTypeChange = (value: VerificationType) => {
    setType(value);
    form.setFieldValue("type", value);
    form.resetFields([
      ["data", "legalName"], ["data", "dateOfBirth"], ["data", "idNumber"],
      ["data", "proofOfIdentityResourceId"], ["data", "proofOfAddressResourceId"], ["data", "selfieResourceId"],
      ["data", "businessName"], ["data", "registrationNumber"],
      ["data", "certificationOfIncorporationResourceId"], ["data", "businessRegistrationDocumentResourceId"],
      ["data", "shareHoldingDocumentResourceId"], ["data", "proofOfBusinessAddressResourceId"],
      ["data", "businessAccountStatementResourceId"],
    ]);
  };

  const onFinish: FormProps<TUniObject>["onFinish"] = async (values) => {
    try {
      setIsUploadingDocuments(true);
      const payload: Record<string, unknown> = { type: values.type };
      if (values.note) payload.note = values.note;

      const data = (values.data || {}) as Record<string, unknown>;
      const uploadFields = values.type === "KYC" ? KYC_RESOURCE_FIELDS : KYB_RESOURCE_FIELDS;
      const uploadFieldSet = new Set<string>(uploadFields);

      Object.entries(data).forEach(([key, item]) => {
        if (!item || uploadFieldSet.has(key)) return;
        if (typeof item === "object" && "format" in item) {
          payload[key] = (item as { format: (v: string) => string }).format("YYYY-MM-DD");
          return;
        }
        payload[key] = item;
      });

      for (const field of uploadFields) {
        const file = extractFileFromUploadValue(data[field]);
        if (!file) continue;
        const res = await uploadResource(file, { purpose: RESOURCE_PURPOSE.KYC_DOCUMENT });
        payload[field] = res.resourceId;
      }

      await uploadMu(payload).unwrap();

      messageApi.open({ key: "uploadRequest", type: "success", content: "Verification submitted successfully 🎉", duration: 2 });
      setTimeout(() => router.push("/verification/requests"), 500);
    } catch (error) {
      applyApiErrorToForm(error, form, [
        "legalName", "dateOfBirth", "idNumber",
        "proofOfIdentityResourceId", "proofOfAddressResourceId", "selfieResourceId",
        "businessName", "registrationNumber",
        "certificationOfIncorporationResourceId", "businessRegistrationDocumentResourceId",
        "shareHoldingDocumentResourceId", "proofOfBusinessAddressResourceId",
        "businessAccountStatementResourceId", "note",
      ], {
        legalName: ["data", "legalName"], dateOfBirth: ["data", "dateOfBirth"], idNumber: ["data", "idNumber"],
        proofOfIdentityResourceId: ["data", "proofOfIdentityResourceId"],
        proofOfAddressResourceId: ["data", "proofOfAddressResourceId"],
        selfieResourceId: ["data", "selfieResourceId"],
        businessName: ["data", "businessName"], registrationNumber: ["data", "registrationNumber"],
        certificationOfIncorporationResourceId: ["data", "certificationOfIncorporationResourceId"],
        businessRegistrationDocumentResourceId: ["data", "businessRegistrationDocumentResourceId"],
        shareHoldingDocumentResourceId: ["data", "shareHoldingDocumentResourceId"],
        proofOfBusinessAddressResourceId: ["data", "proofOfBusinessAddressResourceId"],
        businessAccountStatementResourceId: ["data", "businessAccountStatementResourceId"],
        note: ["note"],
      });
      errorAlert({ error, messageApi });
    } finally {
      setIsUploadingDocuments(false);
    }
  };

  const isSubmitting = isLoading || isUploadingDocuments;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-6 pt-4">
        <AppBreadcrumb
          items={[{ title: "Home", href: "/overview" }, { title: "Verification", href: "/verification" }, { title: "Identity Verification" }]}
          className="text-xs text-muted-text"
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className=""></div>
          <button
            onClick={() => router.push("/verification/requests")}
            className="px-4 py-2 rounded-md border border-border-primary text-sm font-medium text-secondary-text hover:border-brand-primary hover:text-primary-text transition-all bg-secondary-bg shrink-0 flex items-center gap-2"
          >
            <FiExternalLink className="w-4 h-4" />
            View All Requests
          </button>
        </div>
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
          {/* Status card */}
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
            {(() => {
              const statusUpper = currentKycStatus?.toUpperCase();
              if (["APPROVED", "COMPLETED", "VERIFIED"].includes(statusUpper)) {
                return null;
              }
              if (statusUpper === "PENDING") {
                return (
                  <button
                    onClick={() => router.push("/verification/requests")}
                    className="px-4 py-2 rounded-md bg-brand-primary text-black text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-brand-primary/20 flex items-center justify-center shrink-0 text-white"
                  >
                    Pending for Review
                  </button>
                );
              }
              return (
                <button
                  onClick={scrollToForm}
                  className="px-4 py-2 rounded-md bg-brand-primary text-black text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-brand-primary/20 flex items-center justify-center shrink-0 text-white"
                >
                  Start Verification
                </button>
              );
            })()}
          </div>

          {/* How it works */}
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

          {/* Form card or Status card */}
          {["NOT_SUBMITTED", "REJECTED"].includes(currentKycStatus) ? (
            <div ref={formRef} className="bg-secondary-bg border border-border-primary rounded-lg overflow-hidden shadow-sm">
              {/* Form header */}
              <div className="px-4 py-4 border-b border-border-primary">
                <h2 className="text-xl font-semibold text-primary-text">Verification Clearance Form</h2>
                <p className="text-base text-secondary-text mt-1.5">All administrative records are securely encrypted and verified. Supported document types: PDF, JPG, PNG.</p>
              </div>

              <div className="p-4 md:p-6">
                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} className="space-y-6">

                  {/* Step 1: Choose type */}
                  <div className="space-y-6">
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-text">Step 1 — Select Verification Type</p>
                    <Form.Item
                      name="type"
                      rules={[{ required: true, message: "Please select a verification type." }]}
                      className="mb-0"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {([
                          {
                            value: "KYC" as VerificationType,
                            icon: <FiUser className="w-5 h-5" />,
                            label: "Individual Identity Verification (KYC)",
                            sub: "For personal accounts — Verify your official identity using a Government-issued ID card, international passport, or driving license.",
                            tag: "Recommended for Creators",
                            tagColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
                            activeRing: "border-brand-primary bg-brand-primary/5",
                            iconBg: "bg-brand-primary/10 text-brand-primary",
                          },
                          {
                            value: "KYB" as VerificationType,
                            icon: <FiBriefcase className="w-5 h-5" />,
                            label: "Corporate Business Verification (KYB)",
                            sub: "For companies, agencies, and organisations — Validate corporate legitimacy using registration certificate and administrative documents.",
                            tag: "For Agencies & Companies",
                            tagColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
                            activeRing: "border-brand-primary bg-brand-primary/5",
                            iconBg: "bg-brand-primary/10 text-brand-primary",
                          },
                        ] as const).map((opt) => {
                          const isActive = type === opt.value;

                          return (
                            <div
                              key={opt.value}
                              onClick={() => handleTypeChange(opt.value)}
                              className={`relative flex items-start gap-4 p-4 rounded-md border text-left transition-all cursor-pointer ${isActive ? opt.activeRing : "border-border-primary bg-secondary-bg hover:border-brand-primary"
                                }`}
                            >
                              {isActive && (
                                <div className="absolute top-4 right-4 w-5 h-5 rounded-md bg-brand-primary flex items-center justify-center">
                                  <FiCheckCircle className="w-3 h-3 text-black" />
                                </div>
                              )}
                              <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                                {opt.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-semibold text-primary-text">{opt.label}</p>
                                <p className="text-sm text-secondary-text mt-2 leading-relaxed">{opt.sub}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-4 w-full">
                                  {opt.value === "KYC" ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartKyc();
                                        }}
                                        disabled={isStartingKyc}
                                        className="px-4 py-2 rounded-md bg-brand-primary text-black text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-brand-primary/20 flex items-center justify-center shrink-0 text-white disabled:opacity-50"
                                      >
                                        {isStartingKyc ? "Starting..." : "Start Identity Verification"}
                                      </button>
                                      <span className={`inline-block text-xs font-medium px-3 py-1.5 rounded-sm border ${opt.tagColor}`}>
                                        {opt.tag}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartKyb();
                                        }}
                                        disabled={isStartingKyc}
                                        className="px-4 py-2 rounded-md bg-brand-primary text-black text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-brand-primary/20 flex items-center justify-center shrink-0 text-white disabled:opacity-50"
                                      >
                                        {isStartingKyc ? "Starting..." : "Start Business Verification"}
                                      </button>
                                      <span className={`inline-block text-xs font-medium px-3 py-1.5 rounded-sm border ${opt.tagColor}`}>
                                        {opt.tag}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Form.Item>
                  </div>

                  {/* KYC Fields (Hidden, using automated flow) */}
                  {/* type === "KYC" && (
                    <div className="space-y-6 pt-6 border-t border-border-primary">
                      <div className="space-y-4">
                        <p className="text-sm font-medium uppercase tracking-wider text-muted-text flex items-center gap-2">
                          <FiUser className="w-4 h-4" /> Step 2 — Personal Identification Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            name={["data", "legalName"]}
                            label={<span className="text-sm font-medium text-primary-text">Legal Full Name</span>}
                            rules={[{ required: true, message: "Legal name is required." }]}
                          >
                            <Input placeholder="e.g. John Doe" className="h-12 rounded-md bg-primary-bg border border-border-primary text-primary-text text-sm px-4" />
                          </Form.Item>
                          <Form.Item
                            name={["data", "dateOfBirth"]}
                            label={<span className="text-sm font-medium text-primary-text">Date of Birth</span>}
                            rules={[{ required: true, message: "Date of birth is required." }]}
                          >
                            <DatePicker className="w-full h-12 rounded-md bg-primary-bg border border-border-primary text-primary-text text-sm px-4" placeholder="Select date of birth" format="YYYY-MM-DD" />
                          </Form.Item>
                          <Form.Item
                            name={["data", "idNumber"]}
                            label={<span className="text-sm font-medium text-primary-text">National ID / Passport Identifier</span>}
                            rules={[{ required: true, message: "ID number is required." }]}
                            className="md:col-span-2"
                          >
                            <Input placeholder="e.g. NID-123456789" className="h-12 rounded-md bg-primary-bg border border-border-primary text-primary-text text-sm px-4" />
                          </Form.Item>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border-primary">
                        <p className="text-sm font-medium uppercase tracking-wider text-muted-text flex items-center gap-2">
                          <FiFileText className="w-4 h-4" /> Step 3 — Upload Verifiable Document Records
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <UploadZone
                            form={form}
                            name={["data", "proofOfIdentityResourceId"]}
                            label="Proof of Identity"
                            hint="National ID, Passport, or Driver's License"
                            icon={<FiUser className="w-4 h-4 text-secondary-text" />}
                          />
                          <UploadZone
                            form={form}
                            name={["data", "proofOfAddressResourceId"]}
                            label="Proof of Address"
                            hint="Utility bill or bank statement (3 months)"
                            icon={<FiFileText className="w-4 h-4 text-secondary-text" />}
                          />
                          <UploadZone
                            form={form}
                            name={["data", "selfieResourceId"]}
                            label="Selfie Verification"
                            hint="Hold your ID next to your face clearly"
                            icon={<FiUploadCloud className="w-4 h-4 text-secondary-text" />}
                          />
                        </div>
                      </div>
                    </div>
                  ) */}

                  {/* KYB Fields - Hidden as per client requests, using automated Sumsub flow */}
                  {false && type === "KYB" && (
                    <div className="space-y-6 pt-6 border-t border-border-primary">
                      <div className="space-y-4">
                        <p className="text-sm font-medium uppercase tracking-wider text-muted-text flex items-center gap-2">
                          <FiBriefcase className="w-4 h-4" /> Step 2 — Business Registration Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            name={["data", "businessName"]}
                            label={<span className="text-sm font-medium text-primary-text">Business Name</span>}
                            rules={[{ required: true, message: "Business name is required." }]}
                          >
                            <Input placeholder="e.g. Acme Media LLC" className="h-12 rounded-md bg-primary-bg border border-border-primary text-primary-text text-sm px-4" />
                          </Form.Item>
                          <Form.Item
                            name={["data", "registrationNumber"]}
                            label={<span className="text-sm font-medium text-primary-text">Official Registration Number</span>}
                            rules={[{ required: true, message: "Registration number is required." }]}
                          >
                            <Input placeholder="e.g. REG-2026-0091" className="h-12 rounded-md bg-primary-bg border border-border-primary text-primary-text text-sm px-4" />
                          </Form.Item>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border-primary">
                        <p className="text-sm font-medium uppercase tracking-wider text-muted-text flex items-center gap-2">
                          <FiFileText className="w-4 h-4" /> Step 3 — Business Documentation Records
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <UploadZone form={form} name={["data", "certificationOfIncorporationResourceId"]} label="Certificate of Incorporation" hint="Official company registration certificate" />
                          <UploadZone form={form} name={["data", "businessRegistrationDocumentResourceId"]} label="Business Registration Document" hint="Official corporate tax registry" />
                          <UploadZone form={form} name={["data", "shareHoldingDocumentResourceId"]} label="Shareholding Registry" hint="Active shareholder distribution structure" />
                          <UploadZone form={form} name={["data", "proofOfBusinessAddressResourceId"]} label="Proof of Business Address" hint="Utility bills or registry location mail" />
                          <UploadZone form={form} name={["data", "businessAccountStatementResourceId"]} label="Business Bank Statement" hint="Last 3 months of bank statements" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Note & Submit (Only for KYB) - Hidden as per client requests, using automated Sumsub flow */}
                  {false && type === "KYB" && (
                    <div className="space-y-6 pt-6 border-t border-border-primary">
                      <Form.Item
                        name="note"
                        label={
                          <div>
                            <span className="text-sm font-medium text-primary-text">Additional Review Note</span>
                            <span className="text-xs text-muted-text ml-2">(Optional)</span>
                          </div>
                        }
                        className="mb-0"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Attach additional processing notes or operational details for compliance auditors..."
                          className="rounded-md bg-primary-bg text-primary-text border-border-primary p-3 text-sm h-40!"
                        />
                      </Form.Item>

                      {/* Security note */}
                      <div className="flex items-start gap-3 p-4 rounded-md bg-brand-primary/5 border border-brand-primary/20">
                        <FiShield className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-secondary-text leading-relaxed">
                          Your identification papers are protected via <strong className="text-primary-text font-semibold">end-to-end industry standard encryption</strong> and checked by compliance administrators within <strong className="text-primary-text font-semibold">1–3 business days</strong>.
                        </p>
                      </div>

                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full h-10 bg-brand-primary text-black font-medium rounded-md border-none hover:opacity-90 shadow-sm shadow-brand-primary/20 transition-all cursor-pointer text-sm flex items-center justify-center"
                      >
                        {!isSubmitting && "Submit Verification Payload"}
                      </Button>
                    </div>
                  )}
                </Form>
              </div>
            </div>
          ) : (
            <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-8 text-center space-y-4">
              <FiShield className="w-10 h-10 text-brand-primary mx-auto" />
              <h2 className="text-xl font-semibold text-primary-text">Verification Under Review or Completed</h2>
              <p className="text-base text-secondary-text max-w-md mx-auto">
                Your verification request has already been submitted and is currently <strong className="text-primary-text">{currentKycStatus.replace('_', ' ')}</strong>. You will be notified of any administrative updates.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => router.push("/verification/requests")}
                  className="px-6 py-2.5 rounded-md bg-brand-primary text-black font-semibold hover:opacity-90 transition-all shadow-sm shadow-brand-primary/20 text-white"
                >
                  View Verification Requests
                </button>
              </div>
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
          onSuccess={handleKycSuccess}
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
          onSuccess={handleKybSuccess}
        />
      </GlobalModal>
    </div>
  );
};

export default VerificationForm;
