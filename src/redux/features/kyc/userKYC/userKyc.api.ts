import { TArgs } from "@/types";
import { baseApi } from "../../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

export type TSumsubWebhookPayload = {
  type: string;
  applicantId: string;
  externalUserId?: string;
  reviewStatus?: string;
  reviewResult?: {
    reviewAnswer?: string;
    rejectLabels?: string[];
    moderationComment?: string;
  };
};

const userKycApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyKyc: builder.mutation({
      query: (data) => {
        return {
          url: `kyc/requests`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["kyc", "auth"],
    }),
    getMyKycRequests: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `kyc/my-requests`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => response.data,
      providesTags: ["kyc"],
    }),
    getMyKycRequestDetails: builder.query({
      query: (id: string) => {
        return {
          url: `kyc/my-requests/${id}`,
          method: "GET",
        };
      },
      transformResponse: (response: { data?: unknown }) =>
        response?.data ?? response,
      providesTags: ["kyc"],
    }),
    getMyKycStatus: builder.query({
      query: () => {
        return {
          url: `kyc/my-status`,
          method: "GET",
        };
      },
      transformResponse: (response: { data?: unknown }) => response?.data,
      providesTags: ["kyc"],
    }),


    startKyc: builder.mutation<any, void>({
      query: () => {
        return {
          url: `kyc/sumsub/token`,
          method: "POST",
        };
      },
      invalidatesTags: ["kyc", "auth"],
    }),
    fallbackWebhook: builder.mutation<any, TSumsubWebhookPayload>({
      query: (data) => {
        return {
          url: `kyc/sumsub/webhook`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["kyc", "auth"],
    }),
    getStatus: builder.query({
      query: () => {
        return {
          url: `kyc/sync`,
          method: "GET",
        };
      },
      providesTags: ["kyc"],
    }),
    syncKycStatus: builder.mutation<any, void>({
      query: () => {
        return {
          url: `kyc/sync`,
          method: "POST",
        };
      },
      invalidatesTags: ["kyc", "auth"],
    })
  }),
});

export const {
  useVerifyKycMutation,
  useGetMyKycRequestsQuery,
  useGetMyKycRequestDetailsQuery,
  useGetMyKycStatusQuery,
  useStartKycMutation,
  useFallbackWebhookMutation,
  useGetStatusQuery,
  useSyncKycStatusMutation,
} = userKycApi;
