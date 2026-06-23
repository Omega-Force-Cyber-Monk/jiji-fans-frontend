import { TArgs } from "@/types";
import { baseApi } from "../../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

const adminKycApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKycApplications: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `kyc/admin/requests`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => response.data,
      providesTags: ["kyc"],
    }),
    getKycApplicationDetails: builder.query({
      query: (id: string) => {
        return {
          url: `kyc/admin/requests/${id}`,
          method: "GET",
        };
      },
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: ["kyc"],
    }),
    updateKycStatus: builder.mutation({
      query: ({
        id,
        ...body
      }: {
        id: string;
        status: string;
        rejectionReason?: string;
      }) => {
        return {
          url: `kyc/admin/requests/${id}/review`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["kyc"],
    }),
    getSumsubHistory: builder.query({
      query: (id: string) => {
        return {
          url: `kyc/admin/creators/${id}/sumsub-history`,
          method: "GET",
        };
      },
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: ["kyc"],
    }),
  }),
});

export const {
  useGetKycApplicationsQuery,
  useGetKycApplicationDetailsQuery,
  useUpdateKycStatusMutation,
  useGetSumsubHistoryQuery,
} = adminKycApi;
