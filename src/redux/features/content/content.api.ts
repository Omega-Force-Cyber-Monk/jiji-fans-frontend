import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";
import { TContent } from "../channel/channel.api";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

export interface ContentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: TContent[];
}

export interface TrackAnalyticsPayload {
  contentId: string;
  channelId: string;
}

const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Content Management
    uploadContent: builder.mutation({
      query: (body) => {
        return {
          url: `contents`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["content"],
    }),
    getChannelContents: builder.query<any, string>({
      query: (channelId) => {
        return {
          url: `contents/channel/${channelId}`,
          method: "GET",
        };
      },
      providesTags: ["content"],
    }),
    getContentById: builder.query<{ data: any }, string>({
      query: (channelId) => {
        return {
          url: `contents/details/${channelId}`,
          method: "GET",
        };
      },
      providesTags: ["content"],
    }),
    // for admin
    dashboardContent: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `dashboard/contents`,
          method: "GET",
          params,
        };
      },
      providesTags: ["content"],
    }),
    dashboardContentDetails: builder.query<any, string>({
      query: (id: string) => {
        console.log("id from api", id);
        return {
          url: `dashboard/content/${id}/details`,
          method: "GET",
        };
      },
      providesTags: ["content"],
    }),
    contentManage: builder.mutation({
      query: (body: { id: string; status: string }) => {
        return {
          url: `dashboard/content/${body.id}/status`,
          method: "PATCH",
          body: { status: body.status },
        };
      },
      invalidatesTags: ["content"],
    }),
    trackAnalytics: builder.mutation<void, TrackAnalyticsPayload>({
      query: (body) => {
        return {
          url: `analytics`,
          method: "POST",
          body,
        };
      },
    }),
    reactToContent: builder.mutation({
      query: ({ contentId, reactionType }: { contentId: string; reactionType: "LIKE" | "DISLIKE" | "" }) => ({
        url: `contents/${contentId}/reaction`,
        method: "PATCH",
        body: { reactionType },
      }),
      invalidatesTags: ["react"],
    }),
    addComment: builder.mutation({
      query: ({ contentId, body }: { contentId: string; body: string }) => ({
        url: `contents/${contentId}/comments`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: ["comment"],
    }),
    getComments: builder.query({
      query: ({ contentId, cursor, limit }: { contentId: string; cursor?: string; limit?: number }) => {
        const params = new URLSearchParams();
        if (cursor) params.append("cursor", cursor);
        if (limit) params.append("limit", String(limit));
        return {
          url: `contents/details/${contentId}/comments`,
          method: "GET",
          params,
        };
      },
      providesTags: ["comment"],
    }),
    addReply: builder.mutation({
      query: ({ commentId, body }: { commentId: string; body: string }) => ({
        url: `contents/comments/${commentId}/replies`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: ["comment"],
    }),
    getCreatorRecentComments: builder.query({
      query: (args: { page?: number; limit?: number }) => {
        const params = new URLSearchParams();
        if (args.page) params.append("page", String(args.page));
        if (args.limit) params.append("limit", String(args.limit));
        return {
          url: `contents/creator/recent-comments`,
          method: "GET",
          params,
        };
      },
      providesTags: ["comment"],
    }),
  }),
});

export const {
  useUploadContentMutation,
  useGetChannelContentsQuery,
  useGetContentByIdQuery,
  useDashboardContentQuery,
  useDashboardContentDetailsQuery,
  useContentManageMutation,
  useTrackAnalyticsMutation,
  useReactToContentMutation,
  useAddCommentMutation,
  useGetCommentsQuery,
  useAddReplyMutation,
  useGetCreatorRecentCommentsQuery,
} = contentApi;
