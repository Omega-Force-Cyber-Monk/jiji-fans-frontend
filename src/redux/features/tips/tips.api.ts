import { baseApi } from "../../api/baseApi";

export interface ITipCheckoutStripe {
  contentId: string;
  amount: number;
}

export interface ITipCheckoutPawaPay {
  contentId: string;
  amount: number;
  phoneNumber?: string;
  country?: string;
  currency?: string;
}

export interface ITipCheckoutPaynow {
  contentId: string;
  amount: number;
  phoneNumber?: string; 
  email?: string;
  country?: string;
  currency?: string;
}

const tipsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStripeTipSession: builder.mutation({
      query: ({ body, idempotencyKey }: { body: ITipCheckoutStripe; idempotencyKey?: string }) => ({
        url: `tips/checkout/session/stripe`,
        method: "POST",
        body,
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }),
    }),
    createPawaPayTipSession: builder.mutation({
      query: ({ body, idempotencyKey }: { body: ITipCheckoutPawaPay; idempotencyKey?: string }) => ({
        url: `tips/checkout/session/pawapay`,
        method: "POST",
        body,
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }),
    }),
    createPaynowTipSession: builder.mutation({
      query: ({ body, idempotencyKey }: { body: ITipCheckoutPaynow; idempotencyKey?: string }) => ({
        url: `tips/checkout/session/paynow`,
        method: "POST",
        body,
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      }),
    }),
  }),
});

export const {
  useCreateStripeTipSessionMutation,
  useCreatePawaPayTipSessionMutation,
  useCreatePaynowTipSessionMutation,
} = tipsApi;
