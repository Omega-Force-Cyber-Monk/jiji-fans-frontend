import { TUser } from "@/redux/features/auth/authSlice";

// API Success Response Type
export interface ApiSuccessResponse<T = unknown> {
  statusCode: 200 | 201;
  success: true;
  message: string;
  data: T;
}

// API Error Source Type
export interface ApiErrorSource {
  path: string;
  message: string;
}

export type TResError = {
  data: {
    message: string;
  };
};

// API Error Response Type
export interface ApiErrorResponse extends TResError {
  success: false;
  message: string;
  errorSources: ApiErrorSource[];
  stack: string;
}

// Combined Response Type
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Type Guards
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

// Auth Response Types
export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "creator" | "user";
  country?: string;
  gender?: string;
  language?: string;
  isActive: boolean;
  isDeleted: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: TUser;
  needsVerification?: boolean;
}

export interface SignUpResponseData {
  message?: string;
}

export interface VerifyOtpResponseData {
  token: string;
}
