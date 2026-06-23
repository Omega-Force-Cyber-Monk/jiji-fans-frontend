import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication endpoints
    registration: builder.mutation({
      query: (data) => {
        return {
          url: `auth/signup`,
          method: "POST",
          body: data,
        };
      },
    }),
    verifyOtp: builder.mutation({
      query: (data) => {
        return {
          url: `auth/verify-otp`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["auth"],
    }),
    resendOtp: builder.mutation({
      query: (data) => {
        return {
          url: `auth/resend-otp`,
          method: "POST",
          body: data,
        };
      },
    }),
    login: builder.mutation({
      query: (data) => {
        return {
          url: `auth/signin`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["auth"],
    }),
    forgotPassword: builder.mutation({
      query: (data) => {
        return {
          url: `auth/forgot-password`,
          method: "POST",
          body: data,
        };
      },
    }),
    resetPassword: builder.mutation({
      query: (data) => {
        const { token, ...body } = data;
        console.log("Data in resetPassword:", data, token);
        return {
          url: `auth/reset-password`,
          method: "POST",
          body,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    }),
    changePassword: builder.mutation({
      query: (body) => {
        return {
          url: `auth/change-password`,
          method: "POST",
          body,
        };
      },
    }),
    deleteAccount: builder.mutation({
      query: (body) => {
        return {
          url: `auth/delete-account`,
          method: "DELETE",
          body,
        };
      },
      invalidatesTags: ["auth"],
    }),
  }),
});

export const {
  useRegistrationMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = authApi;
