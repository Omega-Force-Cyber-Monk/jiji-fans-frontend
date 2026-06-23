import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Statistics & Analytics
    adminStats: builder.query({
      query: () => {
        return {
          url: `dashboard/stats`,
          method: "GET",
        };
      },
      providesTags: ["content", "wallet", "user"],
    }),
    recentUser: builder.query({
      query: () => {
        return {
          url: `dashboard/users/recent`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),
    // analytics
    diviceStatus: builder.query({
      query: () => {
        return {
          url: `analytics/device-stats`,
          method: "GET",
        };
      },
      transformResponse: (response) => response.data,
    }),
    recentViewers: builder.query({
      query: () => {
        return {
          url: `analytics/recent`,
          method: "GET",
        };
      },
      transformResponse: (response) => response.data,
    }),
    analyticsStatus: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `analytics/views-chart`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useAdminStatsQuery,
  useRecentUserQuery,
  useAnalyticsStatusQuery,
  useRecentViewersQuery,
  useDiviceStatusQuery,
} = adminDashboardApi;
