import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

export type TCreateReportBody = {
  channel: string;
  title: string;
  description: string;
};

const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Reports
    submitReport: builder.mutation<unknown, TCreateReportBody>({
      query: (body: TCreateReportBody) => {
        return {
          url: `reports`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["reports"],
    }),
    getChannelReports: builder.query({
      query: ({ channelId, args }: { channelId: string; args?: TArgs }) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: `reports/channel/${channelId}`,
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getAllReports: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `reports`,
          method: "GET",
          params,
        };
      },
      providesTags: ["reports"],
    }),
    getReportDetails: builder.query({
      query: (id) => {
        return {
          url: `reports/${id}/details`,
          method: "GET",
        };
      },
      transformResponse: (response) => response.data,
      providesTags: ["reports"],
    }),
  }),
});

export const {
  useSubmitReportMutation,
  useGetChannelReportsQuery,
  useGetAllReportsQuery,
  useGetReportDetailsQuery,
} = reportsApi;
