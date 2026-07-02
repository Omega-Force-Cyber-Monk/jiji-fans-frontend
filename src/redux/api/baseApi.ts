import { apiUrl } from "@/config";
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getAccessToken, getRefreshToken } from "@/lib/auth/tokenUtils";
import { logout, setAccessTokenAction } from "../features/auth/authSlice";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: apiUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getAccessToken() || (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh-token",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken } = (refreshResult.data as { data: { accessToken: string } }).data;
        api.dispatch(setAccessTokenAction(accessToken));
        // retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "auth",
    "user",
    "category",
    "notification",
    "subscription",
    "subscriptionPlan",
    "transaction",
    "content",
    "channel",
    "dashboard",
    "wallet",
    "withdraw",
    "reports",
    "adminDashboard",
    "settings",
    "recentlyViewed",
    "payout",
    "kyc",
    "creatorWaitlist",
    "react",
    'comment',
    "conversation",
    "message",
    "stripeConnect"
  ],
  endpoints: () => ({}),
});
