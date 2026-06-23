type TKycType = "KYC" | "KYB";
type TKycStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

export type TKycRequestState = {
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

let selectedKycRequest: TKycRequestState | null = null;
const SESSION_KEY = "selected_kyc_request";

export const setSelectedKycRequest = (request: TKycRequestState) => {
  selectedKycRequest = request;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(request));
  }
};

export const getSelectedKycRequest = (): TKycRequestState | null => {
  if (selectedKycRequest) return selectedKycRequest;
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as TKycRequestState;
    selectedKycRequest = parsed;
    return parsed;
  } catch {
    return null;
  }
};
