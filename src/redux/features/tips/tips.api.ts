import { baseApi } from "../../api/baseApi";

export interface ITipCheckoutStripe {
  contentId: string;
  amount: number;
}

export interface ITipCheckoutPawaPay {
  contentId: string;
  amount: number;
  phoneNumber: string;
  country: string;
  currency: string;
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
      query: (body: ITipCheckoutStripe) => ({
        url: `tips/checkout/session/stripe`,
        method: "POST",
        body,
      }),
    }),
    createPawaPayTipSession: builder.mutation({
      query: (body: ITipCheckoutPawaPay) => ({
        url: `tips/checkout/session/pawapay`,
        method: "POST",
        body,
      }),
    }),
    createPaynowTipSession: builder.mutation({
      query: (body: ITipCheckoutPaynow) => ({
        url: `tips/checkout/session/paynow`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateStripeTipSessionMutation,
  useCreatePawaPayTipSessionMutation,
  useCreatePaynowTipSessionMutation,
} = tipsApi;
