export const KYC_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const KYC_TYPES = {
  KYC: "KYC",
  KYB: "KYB",
} as const;

export type TKycRequestStatus =
  (typeof KYC_REQUEST_STATUS)[keyof typeof KYC_REQUEST_STATUS];

export type TKycType = (typeof KYC_TYPES)[keyof typeof KYC_TYPES];
