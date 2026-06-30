import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";
import type {
  TSubscriptionStatus,
  TPaymentProvider,
} from "@/redux/features/subscription/subscription.api";

export interface TChannel {
  _id: string;
  name: string;
  slug?: string;
  avatar: string;
  description?: string;
  totalSubscribers?: number;
}

export interface TContent {
  _id: string;
  title: string;
  description: string;
  url: string;
  owner: string;
  channel: string;
  hasAccess?: boolean;
  subscriptionTierId?: string;
  status?: string;
}

export interface TPagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}

export type TChannelStatus = "APPROVED" | "REJECTED" | "SUSPENDED" | "PENDING";

export interface TMyChannel {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  about: string;
  avatar: string;
  banner: string;
  totalVideos: number;
  totalSubscribers: number;
  contents: TContent[];
  pagination: TPagination;
  accessToken: string;
  owner: string;
  status?: TChannelStatus;
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  category: string;
  tagline: string;
  about?: string;
}

export interface CreateChannelResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: TMyChannel;
}

export interface MyChannelResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: TMyChannel;
}

export interface PopularChannelsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data:
    | TChannel[]
    | {
        results: TChannel[];
        page?: number;
        limit?: number;
        totalPages?: number;
        totalResults?: number;
      };
}

export interface TChannelPagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface TCategory {
  _id: string;
  categoryName: string;
  categoryIcon: string;
  channels: TChannel[];
  channelPagination: TChannelPagination;
}

export interface TChannelsByCategoryPagination {
  nextCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ChannelsByCategoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    categories: TCategory[];
    pagination: TChannelsByCategoryPagination;
  };
}

export interface ChannelSubscriber {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface ChannelSubscriptionPlan {
  _id: string;
  name: string;
}

export interface ChannelSubscription {
  _id: string;
  subscriber?: ChannelSubscriber;
  subscriptionPlan?: ChannelSubscriptionPlan;
  channelId?: string;
  subscriberId?: string;
  subscriptionPlanId?: string;
  startDate?: string;
  endDate?: string;
  status?: TSubscriptionStatus;
  paymentProvider?: TPaymentProvider;
  paymentStatus?: string;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string;
  isExpired?: boolean;
  isCancelled?: boolean;
  createdAt: string;
}

export interface ChannelSubscribersPagination {
  previousCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ChannelSubscribersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    subscribers: ChannelSubscription[];
    pagination: ChannelSubscribersPagination;
    totalSubscribers: number;
  };
}

const channelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Channel Management
    createChannel: builder.mutation<
      CreateChannelResponse,
      CreateChannelRequest
    >({
      query: (body) => {
        return {
          url: `channels`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["channel", "auth", "user"],
    }),
    editChannelDetails: builder.mutation({
      query: ({ channelId, body }) => {
        return {
          url: `channels/${channelId}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["channel"],
    }),
    editChannelImage: builder.mutation({
      query: ({ channelId, body }) => {
        return {
          url: `channels/${channelId}/image`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["channel"],
    }),
    updateChannelStatus: builder.mutation({
      query: ({
        channelId,
        status,
      }: {
        channelId: string;
        status: TChannelStatus;
      }) => {
        return {
          url: `channels/moderate/${channelId}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: ["channel"],
    }),
    getAllChannels: builder.query({
      query: (args: TArgs) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: `channels`,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    getChannelById: builder.query<
      MyChannelResponse,
      { channelId: string; cursor?: string; page?: number; limit?: number; status?: TChannelStatus }
    >({
      query: ({ channelId, cursor, page, limit, status }) => {
        const params = new URLSearchParams();
        params.append("channel", channelId);
        if (cursor) {
          params.append("cursor", cursor);
        }
        if (page) {
          params.append("page", String(page));
        }
        if (limit) {
          params.append("limit", String(limit));
        }
        if (status) {
          params.append("status", status);
        }
        return {
          url: `channels`,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    getChannelBySlug: builder.query<
      MyChannelResponse,
      { slug: string; cursor?: string; limit?: number }
    >({
      query: ({ slug, cursor, limit }) => {
        const params = new URLSearchParams();
        if (cursor) {
          params.append("cursor", cursor);
        }
        if (limit) {
          params.append("limit", String(limit));
        }
        return {
          url: slug,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    getMyChannel: builder.query<
      MyChannelResponse,
      { cursor?: string; limit?: number; status?: TChannelStatus } | void
    >({
      query: (args?: { cursor?: string; limit?: number; status?: TChannelStatus }) => {
        const params = new URLSearchParams();
        if (args?.cursor) {
          params.append("cursor", args.cursor);
        }
        if (args?.limit) {
          params.append("limit", String(args.limit));
        }
        if (args?.status) {
          params.append("status", args.status);
        }
        return {
          url: `channels/mine`,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    getChannelAbout: builder.query({
      query: (channelId: string) => {
        return {
          url: `channels/${channelId}/about`,
          method: "GET",
        };
      },
      providesTags: ["channel"],
    }),
    getPopularChannels: builder.query<
      PopularChannelsResponse,
      { limit?: number } | void
    >({
      query: (args?: { limit?: number }) => {
        const params = new URLSearchParams();
        if (args?.limit) {
          params.append("limit", String(args.limit));
        }
        return {
          url: `channels/popular`,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    getChannelsByCategory: builder.query<
      ChannelsByCategoryResponse,
      {
        category?: string;
        limit?: number;
        cursor?: string;
        channelCursor?: string;
        channelLimit?: number;
        query?: string;
      } | void
    >({
      query: (args?: {
        category?: string;
        limit?: number;
        cursor?: string;
        channelCursor?: string;
        channelLimit?: number;
        query?: string;
      }) => {
        const params = new URLSearchParams();
        if (args?.category) {
          params.append("category", args.category);
        }
        if (args?.limit) {
          params.append("limit", String(args.limit));
        }
        if (args?.cursor) {
          params.append("cursor", args.cursor);
        }
        if (args?.channelCursor) {
          params.append("channelCursor", args.channelCursor);
        }
        if (args?.channelLimit) {
          params.append("channelLimit", String(args.channelLimit));
        }
        if (args?.query) {
          params.append("query", args.query);
        }
        return {
          url: `channels/category`,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    getMySubscribers: builder.query<
      ChannelSubscribersResponse,
      { limit?: number; cursor?: string } | void
    >({
      query: (args?: { limit?: number; cursor?: string }) => {
        const params = new URLSearchParams();
        if (args?.limit) {
          params.append("limit", String(args.limit));
        }
        if (args?.cursor) {
          params.append("cursor", args.cursor);
        }
        return {
          url: `channels/subscriber`,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    // admin api
    adminChannelDetails: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `channels`,
          method: "GET",
          params,
        };
      },
      providesTags: ["channel"],
    }),
    getContentsByOwner: builder.query<{ data: TContent[] }, string>({
      query: (ownerId) => {
        return {
          url: `contents/owner/${ownerId}`,
          method: "GET",
        };
      },
      providesTags: ["channel"],
    }),
  }),
});

export const {
  useCreateChannelMutation,
  useEditChannelDetailsMutation,
  useEditChannelImageMutation,
  useUpdateChannelStatusMutation,
  useGetAllChannelsQuery,
  useGetChannelByIdQuery,
  useGetChannelBySlugQuery,
  useGetMyChannelQuery,
  useGetChannelAboutQuery,
  useGetPopularChannelsQuery,
  useGetChannelsByCategoryQuery,
  useGetMySubscribersQuery,
  useLazyGetMySubscribersQuery,
  useAdminChannelDetailsQuery,
  useGetContentsByOwnerQuery,
} = channelApi;
