import { baseApi } from "../../api/baseApi";

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyTransaction: builder.mutation({
      query: ({ providerReferenceId, idempotencyKey }: { providerReferenceId: string; idempotencyKey?: string }) => ({
        url: `transactions/verify/${providerReferenceId}`,
        method: "POST",
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }),
    }),
  }),
});

export const { useVerifyTransactionMutation } = paymentApi;
