import { baseApi } from "../../api/baseApi";

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyTransaction: builder.query({
      query: (providerReferenceId: string) => ({
        url: `transactions/verify/${providerReferenceId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useVerifyTransactionQuery, useLazyVerifyTransactionQuery } = paymentApi;
