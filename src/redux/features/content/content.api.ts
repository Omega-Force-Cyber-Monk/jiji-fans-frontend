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
} = contentApi;
