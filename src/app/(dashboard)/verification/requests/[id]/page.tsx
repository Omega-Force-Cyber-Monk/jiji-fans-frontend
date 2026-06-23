"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card } from "antd";
import PageHeading from "@/components/ui/PageHeading";
import LoaderWraperComp from "@/components/LoaderWraperComp";
import { useGetMyKycRequestDetailsQuery } from "@/redux/features/kyc/userKYC/userKyc.api";
import { handleImageError } from "@/lib/handleImageError";
import Image from "next/image";
import {
  FiFileText,
  FiExternalLink,
  FiChevronLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiUser,
  FiHash,
} from "react-icons/fi";
import AppBreadcrumb from "@/components/ui/AppBreadcrumb";

type TKycType = "KYC" | "KYB";
type TKycStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

type TKycRequest = {
  _id: string;
  type: TKycType;
  status: TKycStatus;
  note?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  data?: {
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
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

const isImageUrl = (url: string) =>
  /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(url);

const isPdfUrl = (url: string) => /\.pdf(\?|$)/i.test(url);

const documents: {
  key: keyof NonNullable<TKycRequest["data"]>;
  label: string;
}[] = [
  { key: "proofOfIdentityUrl", label: "Proof of Identity" },
  { key: "proofOfAddressUrl", label: "Proof of Address" },
  { key: "selfieUrl", label: "Selfie Image" },
  {
    key: "certificationOfIncorporationUrl",
    label: "Certificate of Incorporation",
  },
  {
    key: "businessRegistrationDocumentUrl",
    label: "Business Registration Document",
  },
  { key: "shareHoldingDocumentUrl", label: "Shareholding Registry" },
  { key: "proofOfBusinessAddressUrl", label: "Proof of Business Address" },
  { key: "businessAccountStatementUrl", label: "Business Bank Statement" },
];

const Field = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-md border border-border-primary bg-primary-bg p-4 flex items-start gap-3 transition-all duration-300 hover:border-brand-primary/20">
    {icon && <div className="text-secondary-text mt-0.5 shrink-0">{icon}</div>}
    <div className="space-y-1 min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-text">
        {label}
      </p>
      <div className="text-base font-semibold text-primary-text break-words">
        {value || "N/A"}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toUpperCase();
  const map: Record<
    string,
    { icon: React.ReactNode; color: string; bg: string; label: string }
  > = {
    APPROVED: {
      icon: <FiCheckCircle className="w-4 h-4" />,
      color: "text-success",
      bg: "bg-success/10 border-success/20",
      label: "Approved",
    },
    COMPLETED: {
      icon: <FiCheckCircle className="w-4 h-4" />,
      color: "text-success",
      bg: "bg-success/10 border-success/20",
      label: "Completed",
    },
    PENDING: {
      icon: <FiClock className="w-4 h-4" />,
      color: "text-warning",
      bg: "bg-warning/10 border-warning/20",
      label: "Under Review",
    },
    REJECTED: {
      icon: <FiXCircle className="w-4 h-4" />,
      color: "text-error",
      bg: "bg-error/10 border-error/20",
      label: "Rejected",
    },
  };
  const cfg = map[s] || {
    icon: <FiInfo className="w-4 h-4" />,
    color: "text-muted-text",
    bg: "bg-secondary-bg border border-border-primary",
    label: s,
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium border ${cfg.bg} ${cfg.color}`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
};

const RequestDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const {
    data: rawRequest,
    isLoading,
    isError,
    error,
  } = useGetMyKycRequestDetailsQuery(id as string, { skip: !id });
  const request = rawRequest as TKycRequest;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header and Breadcrumb */}
      <div className="space-y-6 pt-4">
        <AppBreadcrumb
          items={[
            { title: "Home", href: "/overview" },
            { title: "Verification", href: "/verification" },
            { title: "Requests", href: "/verification/requests" },
            { title: "Details" },
          ]}
          className="text-xs text-muted-text"
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <PageHeading title="Verification Request Details" />
            <h1 className="text-3xl font-semibold text-primary-text">
              Verification Details
            </h1>
            <p className="text-base text-secondary-text">
              Review submitted legal registry details and uploaded document
              credentials.
            </p>
          </div>
          <Link href="/verification/requests" className="shrink-0">
            <button className="px-4 py-2 rounded-md border border-border-primary text-sm font-medium text-secondary-text hover:border-brand-primary hover:text-primary-text transition-all bg-secondary-bg flex items-center gap-2">
              <FiChevronLeft className="w-4 h-4" />
              Back to Requests
            </button>
          </Link>
        </div>
      </div>

      <LoaderWraperComp
        isError={isError}
        isLoading={isLoading}
        error={error}
        className="h-[45vh]"
      >
        {!request ? (
          <div className="rounded-lg border border-border-primary bg-secondary-bg p-8 text-center space-y-4">
            <FiInfo className="w-10 h-10 text-muted-text mx-auto" />
            <p className="text-base text-secondary-text">
              Requested verification details not found.
            </p>
            <Link href="/verification/requests" className="inline-block pt-2">
              <button className="px-6 py-2.5 rounded-md bg-brand-primary text-black font-semibold hover:opacity-90 transition-all text-white">
                Back to Requests
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Details & Registry Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Core Request Metadata */}
              <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-primary pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-text">
                      Request ID
                    </span>
                    <p className="text-sm font-semibold text-primary-text font-mono">
                      {request._id}
                    </p>
                  </div>
                  <div>
                    <StatusBadge status={request.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Verification Type"
                    value={request.type}
                    icon={<FiUser className="w-4 h-4 text-brand-primary" />}
                  />
                  <Field
                    label="Submitted On"
                    value={formatDate(request.createdAt)}
                    icon={<FiCalendar className="w-4 h-4 text-brand-primary" />}
                  />
                  <Field
                    label="Last Updated"
                    value={formatDate(request.updatedAt)}
                    icon={<FiCalendar className="w-4 h-4 text-brand-primary" />}
                  />
                  <Field
                    label="Address / Region"
                    value={request.data?.address}
                    icon={<FiMapPin className="w-4 h-4 text-brand-primary" />}
                  />
                </div>
              </div>

              {/* Entity details */}
              <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-6">
                <div className="border-b border-border-primary pb-4">
                  <h3 className="text-xl font-semibold text-primary-text flex items-center gap-2">
                    {request.type === "KYB" ? (
                      <>
                        <FiBriefcase className="w-5 h-5 text-brand-primary" />
                        Business Registry Info
                      </>
                    ) : (
                      <>
                        <FiUser className="w-5 h-5 text-brand-primary" />
                        Personal Registry Info
                      </>
                    )}
                  </h3>
                </div>

                {request.type === "KYB" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Registered Business Name"
                      value={request.data?.businessName}
                      icon={<FiBriefcase className="w-4 h-4 text-brand-primary" />}
                    />
                    <Field
                      label="Official Registration Number"
                      value={request.data?.registrationNumber}
                      icon={<FiHash className="w-4 h-4 text-brand-primary" />}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Field
                      label="Legal Full Name"
                      value={request.data?.legalName}
                      icon={<FiUser className="w-4 h-4 text-brand-primary" />}
                    />
                    <Field
                      label="ID Number"
                      value={request.data?.idNumber}
                      icon={<FiHash className="w-4 h-4 text-brand-primary" />}
                    />
                    <Field
                      label="Date of Birth"
                      value={
                        request.data?.dateOfBirth
                          ? new Date(
                              request.data.dateOfBirth
                            ).toLocaleDateString()
                          : "N/A"
                      }
                      icon={<FiCalendar className="w-4 h-4 text-brand-primary" />}
                    />
                  </div>
                )}
              </div>

              {/* Note block */}
              {!!request.note && (
                <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-primary-text flex items-center gap-2">
                    <FiInfo className="w-5 h-5 text-brand-primary" />
                    Additional Note
                  </h3>
                  <div className="p-4 rounded-md border border-border-primary bg-primary-bg">
                    <p className="text-sm leading-relaxed text-secondary-text">
                      {request.note}
                    </p>
                  </div>
                </div>
              )}

              {/* Rejection block */}
              {!!request.rejectionReason && (
                <div className="bg-error/5 border border-error/20 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-error flex items-center gap-2">
                    <FiXCircle className="w-5 h-5" />
                    Rejection Reason Details
                  </h3>
                  <div className="p-4 rounded-md bg-error/10 border border-error/20">
                    <p className="text-sm font-semibold leading-relaxed text-error">
                      {request.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Uploaded Documents */}
            <div className="space-y-6">
              <div className="bg-secondary-bg border border-border-primary rounded-lg p-6 space-y-6 h-full">
                <div className="border-b border-border-primary pb-4">
                  <h3 className="text-xl font-semibold text-primary-text flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-brand-primary" />
                    Document Clearance
                  </h3>
                  <p className="text-xs text-muted-text mt-1">
                    Submitted legal evidence files.
                  </p>
                </div>

                <div className="space-y-4">
                  {(() => {
                    const activeDocs = documents.filter((doc) => {
                      const url = request.data?.[doc.key];
                      return url && typeof url === "string";
                    });

                    if (activeDocs.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <FiFileText className="w-8 h-8 text-muted-text mx-auto mb-2" />
                          <p className="text-sm text-secondary-text">
                            No documents uploaded
                          </p>
                        </div>
                      );
                    }

                    return activeDocs.map((doc) => {
                      const url = request.data?.[doc.key] as string;
                      return (
                        <div
                          key={doc.key}
                          className="relative rounded-md border border-border-primary overflow-hidden h-44 group bg-primary-bg"
                        >
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden p-2">
                            {isPdfUrl(url) ? (
                              <iframe
                                src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full border-none pointer-events-none rounded-sm bg-white"
                                title="PDF Preview"
                              />
                            ) : (
                              <Image
                                src={url}
                                alt={doc.label}
                                fill
                                className="object-contain w-full h-full rounded-sm"
                                onError={handleImageError}
                              />
                            )}
                          </div>

                          {/* Hover Action Overlay */}
                          <div className="absolute inset-0 bg-secondary-bg/95 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center gap-3 p-4 z-10">
                            <div className="text-center w-full px-2">
                              <p className="text-sm font-semibold text-primary-text truncate">
                                {doc.label}
                              </p>
                              <p className="text-xs text-success mt-1 truncate">
                                Uploaded Document
                              </p>
                            </div>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full max-w-[160px] flex items-center justify-center gap-2 bg-primary-bg border border-border-primary text-secondary-text font-medium py-2 rounded-md hover:text-primary-text hover:border-brand-primary text-xs transition-colors"
                            >
                              <FiExternalLink className="w-3.5 h-3.5" />
                              View Full Document
                            </a>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </LoaderWraperComp>
    </div>
  );
};

export default RequestDetailsPage;
