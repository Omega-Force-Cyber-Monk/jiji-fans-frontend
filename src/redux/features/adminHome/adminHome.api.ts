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
    adminDashboardStats: builder.query({
      query: (paramsObj?: { period?: string; dateFrom?: string; dateTo?: string }) => {
        const params = new URLSearchParams();
        if (paramsObj) {
          Object.entries(paramsObj).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, String(value));
            }
          });
        }
        return {
          url: `dashboard/admin/stats`,
          method: "GET",
          params,
        };
      },
      providesTags: ["content", "wallet", "user"],
    }),
    countryMarketShare: builder.query({
      query: (paramsObj?: { period?: string; dateFrom?: string; dateTo?: string; limit?: number }) => {
        const params = new URLSearchParams();
        if (paramsObj) {
          Object.entries(paramsObj).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, String(value));
            }
          });
        }
        return {
          url: `analytics/country-market-share`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => response.data,
    }),
    paymentMethodShare: builder.query({
      query: (paramsObj?: { period?: string; dateFrom?: string; dateTo?: string }) => {
        const params = new URLSearchParams();
        if (paramsObj) {
          Object.entries(paramsObj).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, String(value));
            }
          });
        }
        return {
          url: `analytics/payment-method-share`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => response.data,
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
    getSystemLogs: builder.query({
      query: (paramsObj?: Record<string, any>) => {
        const params = new URLSearchParams();
        if (paramsObj) {
          Object.entries(paramsObj).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, String(value));
            }
          });
        }
        return {
          url: `admin/system-logs`,
          method: "GET",
          params,
        };
      },
    }),
  }),
});

export const {
  useAdminStatsQuery,
  useAdminDashboardStatsQuery,
  useCountryMarketShareQuery,
  usePaymentMethodShareQuery,
  useRecentUserQuery,
  useAnalyticsStatusQuery,
  useRecentViewersQuery,
  useDiviceStatusQuery,
  useGetSystemLogsQuery,
} = adminDashboardApi;
