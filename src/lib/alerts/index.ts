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
  const getIconSvg = (type: string) => {
    switch (type) {
      case "success":
        return `
          <div class="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
            <svg class="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        `;
      case "error":
        return `
          <div class="h-16 w-16 rounded-full bg-error/10 flex items-center justify-center mb-3">
            <svg class="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        `;
      case "warning":
        return `
          <div class="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mb-3">
            <svg class="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        `;
      case "info":
      default:
        return `
          <div class="h-16 w-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3">
            <svg class="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        `;
    }
  };

  Swal.fire({
    html: `
      <div class="flex flex-col items-center gap-2 pt-2 pb-2">
          ${getIconSvg(icon)}
          <h3 class="text-xl font-bold text-primary-text m-0">${title || "Success!"}</h3>
          <p class="text-secondary-text text-sm m-0 mt-1">${text || "Your action was successful."}</p>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: "Ok",
    buttonsStyling: false,
    background: "var(--primary-bg)",
    color: "var(--primary-text)",
    customClass: {
      popup: "rounded-xl border border-border-primary shadow-xl p-6",
      htmlContainer: "m-0 p-0",
      actions: "w-full flex justify-center mt-6",
      confirmButton: "w-full sm:w-auto px-8 py-2.5 bg-brand-primary text-black font-semibold rounded-md hover:opacity-90 transition-opacity shadow-sm cursor-pointer",
    },
  });
};
