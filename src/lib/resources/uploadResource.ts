"use client";

import type { UploadFile } from "antd/es/upload/interface";
import { apiUrl } from "@/config";
import {
  getAccessToken,
  getRefreshToken,
  removeAuthTokens,
  setAccessToken,
} from "@/lib/auth/tokenUtils";

export const RESOURCE_PURPOSE = {
  USER_AVATAR: "USER_AVATAR",
  CHANNEL_AVATAR: "CHANNEL_AVATAR",
  CHANNEL_BANNER: "CHANNEL_BANNER",
  CATEGORY_ICON: "CATEGORY_ICON",
  KYC_DOCUMENT: "KYC_DOCUMENT",
  VIDEO: "VIDEO",
} as const;

type TResourcePurpose =
  (typeof RESOURCE_PURPOSE)[keyof typeof RESOURCE_PURPOSE];

type TApiErrorSource = {
  path: string;
  message: string;
};

type TApiError = {
  status?: number;
  data: {
    success: false;
    message: string;
    errorSources: TApiErrorSource[];
    stack: string | null;
  };
};

type TApiResponse<T> = {
  data: T;
  message?: string;
};

type TInitiateUploadResponse = {
  resourceId: string;
  fileKey: string;
  s3Key: string;
  status: string;
  uploadUrl: string;
  method: string;
  headers?: Record<string, string>;
  expiresAt: string;
};

type TResourceStatusResponse = {
  resourceId: string;
  fileKey: string;
  status: string;
  purpose: TResourcePurpose;
  failureReason?: string;
  verifiedAt?: string;
  activatedAt?: string;
  uploadExpiresAt: string;
};

type TUploadResourceOptions = {
  purpose: TResourcePurpose;
  targetId?: string;
  pollIntervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
};

const RESOURCE_READY_STATUSES = new Set(["PENDING", "VERIFIED", "ACTIVE"]);
const RESOURCE_FAILED_STATUSES = new Set(["FAILED", "DELETED"]);

const buildApiUrl = (path: string): string => {
  const normalizedBase = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  return new URL(path, normalizedBase).toString();
};

const createUploadError = (
  message: string,
  errorSources: TApiErrorSource[] = [],
  status?: number,
): TApiError => ({
  status,
  data: {
    success: false,
    message,
    errorSources,
    stack: null,
  },
});

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const toBrowserFile = (value: unknown): File | null => {
  if (isFile(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "originFileObj" in value &&
    isFile((value as UploadFile).originFileObj)
  ) {
    return (value as UploadFile).originFileObj as File;
  }

  return null;
};

export const extractFileFromUploadValue = (value: unknown): File | null => {
  const directFile = toBrowserFile(value);

  if (directFile) {
    return directFile;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const file = toBrowserFile(item);

      if (file) {
        return file;
      }
    }
  }

  if (value && typeof value === "object" && "fileList" in value) {
    return extractFileFromUploadValue(
      (value as { fileList?: UploadFile[] }).fileList ?? [],
    );
  }

  return null;
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    removeAuthTokens();
    return null;
  }

  const response = await fetch(buildApiUrl("auth/refresh-token"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    removeAuthTokens();
    return null;
  }

  const payload = (await response.json()) as TApiResponse<{
    accessToken?: string;
  }>;
  const nextAccessToken = payload?.data?.accessToken;

  if (!nextAccessToken) {
    removeAuthTokens();
    return null;
  }

  setAccessToken(nextAccessToken);
  return nextAccessToken;
};

const parseErrorResponse = async (response: Response): Promise<TApiError> => {
  try {
    const payload = (await response.json()) as Partial<TApiError["data"]> & {
      data?: Partial<TApiError["data"]>;
    };

    const normalized =
      payload?.data && typeof payload.data === "object" ? payload.data : payload;

    return createUploadError(
      normalized?.message || "Request failed",
      normalized?.errorSources || [],
      response.status,
    );
  } catch {
    const message = await response.text();

    return createUploadError(
      message || "Request failed",
      [],
      response.status,
    );
  }
};

const fetchApi = async <T>(
  path: string,
  init: RequestInit,
  retryOnUnauthorized = true,
): Promise<T> => {
  const headers = new Headers(init.headers);
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const nextAccessToken = await refreshAccessToken();

    if (nextAccessToken) {
      return fetchApi<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const payload = (await response.json()) as TApiResponse<T>;
  return payload.data;
};

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createUploadError("Upload cancelled"));
      return;
    }

    const timeout = window.setTimeout(() => {
      resolve();
    }, ms);

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timeout);
          reject(createUploadError("Upload cancelled"));
        },
        { once: true },
      );
    }
  });

const waitForResourceVerification = async (
  resourceId: string,
  { pollIntervalMs = 1500, timeoutMs = 120000, signal }: TUploadResourceOptions,
): Promise<TResourceStatusResponse> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    const resource = await fetchApi<TResourceStatusResponse>(
      `resources/${resourceId}`,
      {
        method: "GET",
        signal,
      },
    );

    if (RESOURCE_READY_STATUSES.has(resource.status)) {
      return resource;
    }

    if (RESOURCE_FAILED_STATUSES.has(resource.status)) {
      throw createUploadError(
        resource.failureReason || "Upload validation failed",
        [
          {
            path: "resourceId",
            message: resource.failureReason || "Upload validation failed",
          },
        ],
      );
    }

    await sleep(pollIntervalMs, signal);
  }

  throw createUploadError(
    "Upload verification timed out. Please try again.",
    [
      {
        path: "resourceId",
        message: "Upload verification timed out. Please try again.",
      },
    ],
  );
};

export const uploadResource = async (
  file: File,
  options: TUploadResourceOptions,
): Promise<TResourceStatusResponse> => {
  const initiated = await fetchApi<TInitiateUploadResponse>(
    "resources/uploads/initiate",
    {
      method: "POST",
      signal: options.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        purpose: options.purpose,
        ...(options.targetId ? { targetId: options.targetId } : {}),
      }),
    },
  );

  const uploadResponse = await fetch(initiated.uploadUrl, {
    method: initiated.method || "PUT",
    headers: initiated.headers,
    body: file,
    signal: options.signal,
  });

  if (!uploadResponse.ok) {
    throw createUploadError(
      "Failed to upload the file to storage",
      [
        {
          path: "file",
          message: "Failed to upload the file to storage",
        },
      ],
      uploadResponse.status,
    );
  }

  return waitForResourceVerification(initiated.resourceId, options);
};
