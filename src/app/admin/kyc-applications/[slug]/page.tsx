"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "@/components/ui/CImage";
import { Button, Input, Modal } from "antd";
import PageHeading from "@/components/ui/PageHeading";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import {
  useGetKycApplicationDetailsQuery,
  useUpdateKycStatusMutation,
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

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const creator = data?.creator;
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
        <Button onClick={() => router.back()} className="min-w-36">
          Back
        </Button>
      </div>
      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        className="h-[50vh]"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                    <h3 className="text-xl font-bold text-slate-800">
                      {isKYB
                        ? kycData?.businessName || creator?.username || "N/A"
                        : kycData?.legalName || creator?.username || "N/A"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {creator?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <p className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          data?.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : data?.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {data?.status || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Address
                    </p>
                    <p className="mt-1 font-medium text-slate-800">
                      {kycData?.address || "N/A"}
                    </p>
                  </div>
                </div>

                {data?.status === "PENDING" && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button
                      type="primary"
                      size="large"
                      loading={updating}
                      onClick={() => handleApprove("APPROVED")}
                      className="!h-11 !rounded-full !border-none !bg-[#00B050] !px-8 !font-semibold hover:!bg-[#00B050]/90"
                    >
                      Approve
                    </Button>
                    <Button
                      type="primary"
                      danger
                      size="large"
                      onClick={() => setRejectModal(true)}
                      className="!h-11 !rounded-full !px-8 !font-semibold"
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {data?.status === "REJECTED" && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Rejection Reason
                    </p>
                    <p className="mt-1 text-sm font-medium text-red-600">
                      {data?.rejectionReason || "No reason provided"}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-4 text-base font-semibold text-slate-800">
                  {isKYB ? "Business Information" : "Personal Information"}
                </h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {isKYB ? (
                    <>
                      <p className="text-slate-700">
                        <span className="font-semibold">Business Name:</span>{" "}
                        {kycData?.businessName || "N/A"}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">
                          Registration Number:
                        </span>{" "}
                        {kycData?.registrationNumber || "N/A"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-700">
                        <span className="font-semibold">ID Number:</span>{" "}
                        {kycData?.idNumber || "N/A"}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Date of Birth:</span>{" "}
                        {kycData?.dateOfBirth
                          ? new Date(kycData.dateOfBirth).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </>
                  )}
                  {data?.note && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Note
                      </p>
                      <p className="mt-1 text-slate-700">{data.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
              <h3 className="mb-4 text-xl font-bold text-slate-800">
                Uploaded Documents
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      {doc.label}
                    </p>
                    {doc.url ? (
                      <>
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                          {isImageUrl(doc.url) ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <Image
                                src={doc.url}
                                alt={doc.label}
                                onError={handleImageError}
                                className="h-56 w-full object-contain bg-slate-100"
                              />
                            </>
                          ) : isPdfUrl(doc.url) ? (
                            <div className="flex h-56 flex-col items-center justify-center bg-slate-50 text-slate-400">
                              <FilePdfOutlined className="text-6xl text-red-500" />
                              <span className="mt-2 font-medium">
                                PDF Document
                              </span>
                            </div>
                          ) : (
                            <div className="flex h-56 items-center justify-center px-4 text-center text-sm text-slate-500">
                              Preview not available for this file type.
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-slate-500">
                            {getFileName(doc.url)}
                          </p>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-[#00B050] hover:underline"
                          >
                            Open
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
                        Not uploaded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LoaderWraperComp>

      {/* Rejection Reason Modal */}
      <Modal
        title={`Reject ${isKYB ? "KYB" : "KYC"} Application`}
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        footer={null}
      >
        <div className="space-y-4 pt-2">
          <Input.TextArea
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button
              type="primary"
              danger
              loading={updating}
              onClick={() => handleApprove("REJECTED")}
              disabled={!rejectionReason.trim()}
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
