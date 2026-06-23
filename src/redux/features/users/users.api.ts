import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

export type TUserAccountStatus = "ACTIVE" | "SUSPENDED";
export type TKycStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "VERIFIED"
  | string;

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Profile endpoints
    getProfile: builder.query({
      query: () => {
        return {
          url: `users/profile`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),
    updateProfile: builder.mutation({
      query: (body) => {
        return {
          url: `users/profile`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["user", "auth"],
    }),
    updateAvatar: builder.mutation({
      query: (body) => {
        return {
          url: `users/profile/avatar`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["user", "auth"],
    }),

    // Recently viewed endpoints
    addRecentlyViewed: builder.mutation({
      query: (channelId: string) => {
        return {
          url: `users/recently-viewed/${channelId}`,
          method: "POST",
        };
      },
      invalidatesTags: ["recentlyViewed"],
    }),
    getRecentlyViewed: builder.query({
      query: () => {
        return {
          url: `users/recently-viewed`,
          method: "GET",
        };
      },
      providesTags: ["recentlyViewed"],
    }),
    // admin api
    allUsers: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `dashboard/users`,
          method: "GET",
          params,
        };
      },
      providesTags: ["user"],
    }),
    getUserDetails: builder.query({
      query: (id: string) => {
        return {
          url: `dashboard/users/${id}/details`,
          method: "GET",
        };
      },
      transformResponse: (response) => response.data,
      providesTags: ["user"],
    }),
    getPublicUserById: builder.query<{ _id: string; username: string; avatar?: string; email?: string } | null, string>({
      query: (id: string) => ({
        url: `users/${id}/profile`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? null,
      providesTags: ["user"],
    }),
    getCreatorDetails: builder.query({
      query: ({ contentId, args }: { contentId: string; args: TArgs }) => {
        const params = buildQueryParams(args);
        return {
          url: `dashboard/owner/${contentId}/channel`,
          method: "GET",
          params,
        };
      },
      providesTags: ["user", "content", "channel"],
    }),
    updateUserStatus: builder.mutation({
      query: ({
        userId,
        status,
      }: {
        userId: string;
        status: TUserAccountStatus;
      }) => {
        return {
          url: `users/${userId}/status`,
          method: "PATCH",
          params: { status },
        };
      },
      invalidatesTags: ["user"],
    }),
    sendMessage: builder.mutation({
      query: (body) => {
        return {
          url: `messages`,
          method: "POST",
          body,
        };
      },
      // invalidatesTags: ["],
    }),

  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useAddRecentlyViewedMutation,
  useGetRecentlyViewedQuery,
  useAllUsersQuery,
  useGetUserDetailsQuery,
  useGetPublicUserByIdQuery,
  useGetCreatorDetailsQuery,
  useUpdateUserStatusMutation,
  useSendMessageMutation,
} = usersApi;
