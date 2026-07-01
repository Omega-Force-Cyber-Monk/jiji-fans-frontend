import { baseApi } from "../../api/baseApi";

export interface YouTubeAuthUrlResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    url?: string;
    authUrl?: string;
  };
}

export interface YouTubeCallbackResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    youtubeConnected: boolean;
    channelTitle?: string;
    channelId?: string;
  };
}

export interface YouTubeUploadSessionResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    uploadUrl: string;
  };
}

const youtubeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getYouTubeAuthUrl: builder.query<YouTubeAuthUrlResponse, void>({
      query: () => ({
        url: "youtube/auth-url",
        method: "GET",
      }),
    }),
    youtubeCallback: builder.mutation<YouTubeCallbackResponse, { code: string }>({
      query: (body) => ({
        url: "youtube/callback",
        method: "POST",
        body,
      }),
      invalidatesTags: ["user"],
    }),
    createYouTubeUploadSession: builder.mutation<
      YouTubeUploadSessionResponse,
      { title: string; description?: string; privacyStatus?: string }
    >({
      query: (body) => ({
        url: "youtube/upload-session",
        method: "POST",
        body,
      }),
    }),
    saveYouTubeVideoId: builder.mutation<
      any,
      { contentId: string; youtubeVideoId: string }
    >({
      query: (body) => ({
        url: "youtube/save-video-id",
        method: "POST",
        body,
      }),
      invalidatesTags: ["content"],
    }),
  }),
});

export const {
  useGetYouTubeAuthUrlQuery,
  useLazyGetYouTubeAuthUrlQuery,
  useYoutubeCallbackMutation,
  useCreateYouTubeUploadSessionMutation,
  useSaveYouTubeVideoIdMutation,
} = youtubeApi;
