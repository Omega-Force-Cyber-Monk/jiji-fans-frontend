import { FormInstance, message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import Swal from "sweetalert2";

// API Error Source Type
export interface ApiErrorSource {
  path: string;
  message: string;
}

// API Error Response Type (from API)
export interface ApiErrorResponse {
  success: false;
  message: string;
  errorSources: ApiErrorSource[];
  stack: string;
}

// RTK Query Error Type
export type TResError = {
  data?: ApiErrorResponse;
  message?: string;
  error?: string;
  status?: number;
  statusCode?: number;
};

export type TRejectResObj = {
  title: string;
  description: string;
};

const normalizeErrorPayload = (error: any) => {
  const payload = error?.data?.data ?? error?.data ?? error;
  const errorMessage =
    payload?.message ||
    error?.message ||
    payload?.error ||
    "Something went wrong. Please try again later.";
  const errorSources =
    payload?.errorSources ||
    error?.data?.errorSources ||
    error?.errorSources ||
    [];

  return { errorMessage, errorSources };
};

export const getApiErrorDetails = (error: any) => {
  const payload = error?.data?.data ?? error?.data ?? error;
  const errorMessage =
    payload?.message ||
    error?.message ||
    payload?.error ||
    "Something went wrong. Please try again later.";
  const errorSources =
    payload?.errorSources ||
    error?.data?.errorSources ||
    error?.errorSources ||
    [];

  return { payload, errorMessage, errorSources };
};

export const applyApiErrorToForm = (
  error: any,
  form?: FormInstance,
  allowedFields?: string[],
  fieldPathMap?: Record<string, string | string[]>,
) => {
  if (!form) return getApiErrorDetails(error);

  const { payload, errorMessage, errorSources } = getApiErrorDetails(error);
  const fields = (allowedFields || []).map((field) => field.toLowerCase());

  if (errorSources.length > 0) {
    const fieldErrors = errorSources
      .map((source: { path?: string; message?: string }) => {
        const normalizedPath = (source.path || "")
          .replace(/^body\./, "")
          .replace(/^files\./, "")
          .replace(/^query\./, "")
          .replace(/^params\./, "")
          .trim();

        if (!normalizedPath) return null;
        if (fields.length > 0 && !fields.includes(normalizedPath.toLowerCase())) {
          return null;
        }

        return {
          name: fieldPathMap?.[normalizedPath] || [normalizedPath],
          errors: [source.message || "Invalid value"],
        };
      })
      .filter(Boolean) as Parameters<FormInstance["setFields"]>[0];

    if (fieldErrors.length > 0) {
      form.setFields(fieldErrors);
    }
  }

  return { payload, errorMessage, errorSources };
};

export const errorAlert = ({
  icon = "error",
  error,
  title,
  messageApi,
}: {
  icon?: "error" | "warning" | "info" | "success";
  error: TResError;
  title?: string;
  /** Pass the `messageApi` from `message.useMessage()` so the toast renders
   *  inside the component's context. Falls back to the static API when omitted. */
  messageApi?: MessageInstance;
}) => {
  const { errorMessage, errorSources } = normalizeErrorPayload(error);

  let detailedErrors = "";
  if (errorSources.length > 0) {
    detailedErrors = errorSources
      .map((err) => `${err.path ? `${err.path}: ` : ""}${err.message}`)
      .join(" • ");
  }

  const content = title
    ? `${title}: ${detailedErrors || errorMessage}`
    : detailedErrors || errorMessage;

  const api = messageApi ?? message;
  api.open({
    type: icon,
    content,
    duration: 5,
  });
};
export const requiredAlert = ({
  icon = undefined,
  title,
  text,
  pathName
}: {
  icon?: "error" | "warning" | "info" | undefined;
  title?: string;
  text?: string;
  pathName?:string;
}) => {
  Swal.fire({
    icon: icon,
    title: title || "Attention Required!",
    text: text || "To proceed with the registration, please Sign-In or Create an account beforehand. This step is essential to complete your registration process.",
    showDenyButton: false,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: "Let's Go ➜",
    cancelButtonText: "Not Now",
    // denyButtonText: `Not Now`,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `/sign-in${pathName ? `?redirect=${encodeURIComponent(pathName)}` : ""}`;
      // router.push(`/sign-in?redirect=${encodeURIComponent(pathName)}`);
    } else if (result.isDenied) {
      // Do nothing
    }
  });
  // console.log(error)
};


export const successAlert = ({
  title,
  text,
  icon = "success",
}: {
  icon?: "success" | "error" | "warning" | "info" | "question";
  title?: string;
  text?: string;
}) => {
  Swal.fire({
    icon: icon,
    title: title || "Success!",
    text: text || "Your action was successful.",
    confirmButtonText: "Ok",
  });
};
