"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "@/components/ui/CImage";
import { Button, Input, Modal, Table, Tag } from "antd";
import PageHeading from "@/components/ui/PageHeading";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import {
  useGetKycApplicationDetailsQuery,
  useUpdateKycStatusMutation,
  useGetSumsubHistoryQuery,
} from "@/redux/features/kyc/adminKYC/adminKyc.api";
import { useAppContext } from "@/lib/providers/ContextProvider";
import { errorAlert } from "@/lib/alerts";
import { handleImageError } from "@/lib/handleImageError";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { FilePdfOutlined } from "@ant-design/icons";
import { TUser } from "@/redux/features/auth/authSlice";

type TKycType = "KYC" | "KYB";
type TKycStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

interface IKycApplication {
  _id: string;
  creatorId: string;
  type: TKycType;
  status: TKycStatus;
  note?: string;
  rejectionReason?: string;
  adjustmentNote?: string;
  kycAdjustmentNote?: string;
  kycRejectedReason?: string;
  data: {
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
  creator: TUser;
  createdAt: string;
  updatedAt: string;
}

const Page = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { messageApi } = useAppContext();
  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useGetKycApplicationDetailsQuery(slug!);
  const data = rawData as IKycApplication;
  const [updateKycStatus, { isLoading: updating }] =
    useUpdateKycStatusMutation();

  const creatorId = typeof data?.creatorId === 'object' ? (data?.creatorId as any)?._id : data?.creatorId;

  const { data: historyData, isLoading: historyLoading } = useGetSumsubHistoryQuery(
    creatorId,
    { skip: !creatorId }
  );

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const creator = data?.creator || (typeof data?.creatorId === 'object' ? data.creatorId : null);
  const kycData = data?.data;
  const isKYB = data?.type === "KYB";

  const handleApprove = async (status: "APPROVED" | "REJECTED") => {
    try {
      await updateKycStatus({
        id: slug!,
        status: status,
        rejectionReason,
      }).unwrap();
      messageApi.open({
        key: "kyc",
        type: "success",
        content: `${isKYB ? "KYB" : "KYC"} application ${status.toLowerCase()} successfully!`,
        duration: 3,
      });
      router.back();
    } catch (err) {
      errorAlert({ error: err, messageApi });
    }
  };

  const getFileName = (url?: string) => {
    if (!url) return "N/A";
    const parts = url.split("/");
    const raw = parts[parts.length - 1];
    const match = raw.match(/\d+-\d+\.(.*)/);
    if (match) return `document.${match[1]}`;
    return raw.length > 30 ? raw.slice(-30) : raw;
  };
  const isImageUrl = (url?: string) =>
    !!url && /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(url);

  const isPdfUrl = (url?: string) => !!url && /\.pdf(\?|$)/i.test(url);

  // KYC documents
  const kycDocuments = [
    {
      label: "Proof identity (Primary documents)",
      url: kycData?.proofOfIdentityUrl,
    },
    {
      label: "Proof address",
      url: kycData?.proofOfAddressUrl,
    },
    {
      label: "Selfie / Liveness check",
      url: kycData?.selfieUrl,
    },
  ];

  // KYB documents
  const kybDocuments = [
    {
      label: "Certificate of Incorporation",
      url: kycData?.certificationOfIncorporationUrl,
    },
    {
      label: "Business Registration Document",
      url: kycData?.businessRegistrationDocumentUrl,
    },
    {
      label: "Shareholding Document",
      url: kycData?.shareHoldingDocumentUrl,
    },
    {
      label: "Proof of Business Address",
      url: kycData?.proofOfBusinessAddressUrl,
    },
    {
      label: "Business Account Statement",
      url: kycData?.businessAccountStatementUrl,
    },
  ];

  const documents = isKYB ? kybDocuments : kycDocuments;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <PageHeading title={`${isKYB ? "KYB" : "KYC"} Application Details`} />
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-md font-semibold text-secondary-text hover:text-primary-text border border-border-primary bg-secondary-bg hover:bg-primary-bg transition-all shadow-sm"
        >
          Back
        </button>
      </div>
      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        className="h-[50vh]"
      >
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-border-primary bg-secondary-bg p-6 shadow-sm transition-all hover:border-brand-primary/30">
                <div className="mb-5 flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-green-500">
                    <Image
                      src={creator?.avatar || "/placeholder.png"}
                      alt="Profile"
                      height={500}
                      width={500}
                      onError={handleImageError}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-text">
                      {isKYB
                        ? kycData?.businessName || creator?.username || "N/A"
                        : kycData?.legalName || creator?.username || "N/A"}
                    </h3>
                    <p className="text-sm text-secondary-text">
                      {creator?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 mt-2">
                  <div className="rounded-xl border border-border-primary bg-primary-bg px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-text">
                      Status
                    </p>
                    <p className="mt-2">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${data?.status === "APPROVED"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : data?.status === "REJECTED"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                      >
                        {data?.status || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-border-primary bg-primary-bg px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-text">
                      Address
                    </p>
                    <p className="mt-1 font-medium text-primary-text">
                      {kycData?.address || "N/A"}
                    </p>
                  </div>
                </div>

                {data?.status === "PENDING" && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      disabled={updating}
                      onClick={() => handleApprove("APPROVED")}
                      className="h-11 px-8 rounded-md font-semibold text-black bg-brand-primary hover:bg-brand-primary/90 transition-all shadow-sm active:scale-95 flex items-center justify-center min-w-[120px]"
                    >
                      {updating ? "Processing..." : "Approve"}
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => setRejectModal(true)}
                      className="h-11 px-8 rounded-md font-semibold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all shadow-sm active:scale-95"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {data?.status === "REJECTED" && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                        Rejection Reason
                      </p>
                      <p className="mt-1 text-sm font-medium text-red-400 font-semibold">
                        {data?.rejectionReason || (data as any)?.kycRejectedReason || "No reason provided"}
                      </p>
                    </div>
                    {(data?.adjustmentNote || (data as any)?.kycAdjustmentNote) && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                          Adjustment Note
                        </p>
                        <p className="mt-1 text-sm font-medium text-red-400">
                          {data?.adjustmentNote || (data as any)?.kycAdjustmentNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border-primary bg-secondary-bg p-6 shadow-sm transition-all hover:border-brand-primary/30">
                <h4 className="mb-4 text-base font-semibold text-primary-text">
                  {isKYB ? "Business Information" : "Personal Information"}
                </h4>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  {isKYB ? (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-secondary-text uppercase text-xs tracking-wider">Business Name</span>
                        <span className="text-primary-text font-medium">{kycData?.businessName || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-secondary-text uppercase text-xs tracking-wider">Registration Number</span>
                        <span className="text-primary-text font-medium">{kycData?.registrationNumber || "N/A"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-secondary-text uppercase text-xs tracking-wider">ID Number</span>
                        <span className="text-primary-text font-medium">{kycData?.idNumber || "N/A"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-secondary-text uppercase text-xs tracking-wider">Date of Birth</span>
                        <span className="text-primary-text font-medium">
                          {kycData?.dateOfBirth
                            ? new Date(kycData.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                            : "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                  {data?.note && (
                    <div className="rounded-xl border border-border-primary bg-primary-bg px-4 py-3 mt-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-text">
                        Note
                      </p>
                      <p className="mt-1 text-primary-text font-medium">{data.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-primary bg-secondary-bg p-6 shadow-sm lg:col-span-3 transition-all hover:border-brand-primary/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary-text">
                  Uploaded Documents
                </h3>
                <span className="text-sm font-medium text-muted-text">{documents.filter(d => d.url).length} of {documents.length} Uploaded</span>
              </div>
              {documents.filter(d => d.url).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="group rounded-xl border border-border-primary bg-primary-bg p-4 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-md hover:shadow-brand-primary/5"
                    >
                      <p className="mb-3 text-sm font-semibold text-primary-text">
                        {doc.label}
                      </p>
                      {doc.url ? (
                        <>
                          <div className="overflow-hidden rounded-lg border border-border-primary bg-secondary-bg/50 relative group-hover:border-brand-primary/30 transition-colors">
                            {isImageUrl(doc.url) ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <Image
                                  src={doc.url}
                                  alt={doc.label}
                                  onError={handleImageError}
                                  className="h-48 w-full object-contain bg-secondary-bg"
                                />
                              </>
                            ) : isPdfUrl(doc.url) ? (
                              <div className="flex h-48 flex-col items-center justify-center bg-secondary-bg text-muted-text">
                                <FilePdfOutlined className="text-6xl text-red-500/80 group-hover:scale-110 transition-transform duration-300" />
                                <span className="mt-3 font-medium text-secondary-text">
                                  PDF Document
                                </span>
                              </div>
                            ) : (
                              <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-muted-text bg-secondary-bg">
                                Preview not available for this file type.
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="truncate text-xs text-muted-text max-w-[180px]">
                              {getFileName(doc.url)}
                            </p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-primary/80 transition-colors bg-brand-primary/10 px-3 py-1.5 rounded-md"
                            >
                              Open
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 stroke-2" />
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-primary/60 text-sm text-muted-text bg-secondary-bg/30">
                          <span className="w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-muted-text/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                          Not Uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-border-primary bg-primary-bg text-center p-6">
                  <p className="text-base font-semibold text-primary-text mb-2">Verification handled via Sumsub</p>
                  <p className="text-sm text-secondary-text">No manual documents were uploaded for this request. Please refer to the Sumsub history below for verification details.</p>
                </div>
              )}
            </div>

            {/* Sumsub History Section */}
            {data?.creatorId && (
              <div className="rounded-2xl border border-border-primary bg-secondary-bg p-6 shadow-sm lg:col-span-5 transition-all hover:border-brand-primary/30 mt-6">
                <h3 className="text-xl font-bold text-primary-text mb-4">
                  Sumsub History
                </h3>
                {historyLoading ? (
                  <p className="text-secondary-text text-sm">Loading history...</p>
                ) : (historyData as any)?.items && (historyData as any).items.length > 0 ? (
                  <div className="w-full overflow-x-auto rounded-xl border border-border-primary bg-primary-bg">
                    <Table
                      dataSource={(historyData as any).items}
                      pagination={false}
                      rowKey="attemptId"
                      className="!rounded-none border-0 whitespace-nowrap"
                      columns={[
                        {
                          title: 'Attempt ID',
                          dataIndex: 'attemptId',
                          key: 'attemptId',
                          render: (text) => <span className="text-sm text-secondary-text font-medium">{text}</span>
                        },
                        {
                          title: 'Level',
                          dataIndex: 'levelName',
                          key: 'levelName',
                          render: (text) => <span className="text-sm text-secondary-text">{text}</span>
                        },
                        {
                          title: 'Status',
                          dataIndex: 'reviewStatus',
                          key: 'reviewStatus',
                          render: (text) => (
                            <span className="uppercase text-xs font-semibold px-2 py-1 rounded-md bg-secondary-bg border border-border-primary text-primary-text">
                              {text}
                            </span>
                          )
                        },
                        {
                          title: 'Answer',
                          key: 'reviewAnswer',
                          render: (_, record: any) => {
                            const answer = record?.reviewResult?.reviewAnswer;
                            const color = answer === 'GREEN' ? 'success' : answer === 'RED' ? 'error' : 'default';
                            return answer ? (
                              <Tag color={color} className="uppercase font-bold m-0">{answer}</Tag>
                            ) : (
                              <span className="text-muted-text">N/A</span>
                            );
                          }
                        },
                        {
                          title: 'Date',
                          dataIndex: 'reviewDate',
                          key: 'reviewDate',
                          render: (text) => (
                            <span className="text-sm text-secondary-text">
                              {text ? new Date(text).toLocaleString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              }) : "N/A"}
                            </span>
                          )
                        }
                      ]}
                    />
                  </div>
                ) : (
                  <p className="text-secondary-text text-sm bg-primary-bg p-4 rounded-xl border border-border-primary text-center">No Sumsub history available for this creator.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </LoaderWraperComp>

      {/* Rejection Reason Modal */}
      <Modal
        title={<span className="text-primary-text font-bold text-lg">Reject {isKYB ? "KYB" : "KYC"} Application</span>}
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        footer={null}
        className="dark-modal"
        styles={{
          content: { backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--border-primary)' },
          header: { backgroundColor: 'var(--secondary-bg)', borderBottom: '1px solid var(--border-primary)' },
          mask: { backdropFilter: 'blur(4px)' }
        }}
        closeIcon={<span className="text-muted-text hover:text-primary-text transition-colors">✕</span>}
      >
        <div className="space-y-4 pt-4">
          <textarea
            rows={4}
            placeholder="Enter a detailed reason for rejecting this application..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full bg-primary-bg border border-border-primary rounded-md p-3 text-primary-text placeholder-muted-text focus:outline-none focus:border-brand-primary transition-all resize-none"
          />
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setRejectModal(false)}
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-secondary-text hover:text-primary-text border border-border-primary bg-secondary-bg hover:bg-primary-bg transition-all"
            >
              Cancel
            </button>
            <button
              disabled={updating || !rejectionReason.trim()}
              onClick={() => handleApprove("REJECTED")}
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Processing..." : "Confirm Reject"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
