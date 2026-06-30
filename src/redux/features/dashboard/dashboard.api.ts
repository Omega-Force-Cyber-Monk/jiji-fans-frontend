import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";

export interface ChannelStatsSubscriber {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export interface ChannelStatsSubscriptionPlan {
  _id: string;
  name: string;
  price: number;
}

export interface ChannelStatsRecentSubscription {
  _id: string;
  channel?: string;
  channelId?: string;
  subscriber?: ChannelStatsSubscriber;
  subscriberId?: ChannelStatsSubscriber;
  subscriptionPlan?: ChannelStatsSubscriptionPlan;
  subscriptionPlanId?: ChannelStatsSubscriptionPlan;
  status?: string;
  paymentProvider?: string;
  startDate?: string;
  endDate?: string;
  pawapayDepositId?: string;
  isPaid?: boolean;
  isRevenueDistributed?: boolean;
  isExpired: boolean;
  expiresAt?: string;
  isCancelled: boolean;
  paymentStatus?: string;
  cancelAtPeriodEnd: boolean;
  requiresPaymentMethodUpdate?: boolean;
  paymentRetryCount?: number;
  username?: string;
  email?: string;
  avatar?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelStatsData {
  totalEarnings: number;
  totalVideos: number;
  totalSubscribers: number;
  churnRate: number;
  retentionRate: number;
  recentSubscriptions: ChannelStatsRecentSubscription[];
}

export interface ChannelStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ChannelStatsData;
}

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Creator Dashboard
    getChannelStats: builder.query<ChannelStatsResponse, void>({
      query: () => {
        return {
          url: `dashboard/channel/stats`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getDashboardStats: builder.query({
      query: () => {
        return {
          url: `creator/dashboard/stats`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getEarningChart: builder.query({
      query: () => {
        return {
          url: `creator/dashboard/chart`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getRecentSubscribers: builder.query({
      query: () => {
        return {
          url: `creator/dashboard/subscribers/recent`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getAllSubscribers: builder.query({
      query: (args: TArgs) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: `creator/dashboard/subscribers`,
          method: "GET",
          params,
        };
      },
      providesTags: ["dashboard"],
    }),
    getEarnings: builder.query({
      query: (args: TArgs) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: `creator/dashboard/earnings`,
          method: "GET",
          params,
        };
      },
      providesTags: ["dashboard"],
    }),
    getContentDetails: builder.query({
      query: (contentId) => {
        return {
          url: `creator/dashboard/content/${contentId}/details`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getUserStats: builder.query({
      query: () => {
        return {
          url: `dashboard/user/stats`,
          method: "GET",
        };
      },
      providesTags: ["dashboard"],
    }),
    getTopPerformingVideos: builder.query({
      query: () => ({
        url: `dashboard/channel/top-performing-videos`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),
    getWatchTimeStats: builder.query({
      query: () => ({
        url: `watch-time/stats`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),
    getChannelEarnings: builder.query<any, void>({
      query: () => ({
        url: `dashboard/channel/earnings`,
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),
  }),
});

export const {
  useGetChannelStatsQuery,
  useGetDashboardStatsQuery,
  useGetEarningChartQuery,
  useGetRecentSubscribersQuery,
  useGetAllSubscribersQuery,
  useGetEarningsQuery,
  useGetContentDetailsQuery,
  useGetUserStatsQuery,
  useGetTopPerformingVideosQuery,
  useGetWatchTimeStatsQuery,
  useGetChannelEarningsQuery,
} = dashboardApi;
