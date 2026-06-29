import { baseApi } from "../../api/baseApi";

export type TSubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED"
  | "PAST_DUE";

export type TPaymentProvider = "STRIPE" | "PAWAPAY" | "PAYNOW";

export interface ISubscription {
  _id: string;
  channelId: string;
  subscriberId: string;
  subscriptionPlanId: string;
  startDate: string;
  endDate: string;
  status: TSubscriptionStatus;
  paymentProvider: TPaymentProvider;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  pawapayDepositId?: string;
  isPaid?: boolean;
  isRevenueDistributed?: boolean;
  cancelAtPeriodEnd?: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubscriptionPlanWithUnlockFlag {
  _id: string;
  name: string;
  price: number;
  commission: number;
  facilities: string[];
  billing_cycle: string;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt?: string;
  updatedAt?: string;
  hasUnlockableContent?: boolean;
}

const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Membership/Subscription endpoints
    createSubscription: builder.mutation({
      query: (body) => {
        return {
          url: `subscriptions`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["subscription"],
    }),
    getMySubscriptions: builder.query({
      query: () => {
        return {
          url: `subscriptions/mine`,
          method: "GET",
        };
      },
      providesTags: ["subscription"],
    }),
    cancelSubscription: builder.mutation({
      query: (args: string | { subscriptionId: string; idempotencyKey?: string }) => {
        const subscriptionId = typeof args === "string" ? args : args.subscriptionId;
        const idempotencyKey = typeof args === "string" ? undefined : args.idempotencyKey;
        return {
          url: `subscriptions/${subscriptionId}/cancel`,
          method: "PATCH",
          headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        };
      },
      invalidatesTags: ["subscription"],
    }),
    getCurrentChannelSubscription: builder.query({
      query: (channelId) => {
        return {
          url: `subscriptions/${channelId}/mine`,
          method: "GET",
        };
      },
      providesTags: ["subscription"],
    }),
    // Subscription Plans
    createSubscriptionPlan: builder.mutation({
      query: (body) => {
        return {
          url: `subscriptionPlans`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["subscriptionPlan"],
    }),
    updateSubscriptionPlan: builder.mutation({
      query: ({ planId, body }) => {
        return {
          url: `subscriptionPlans/${planId}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["subscriptionPlan"],
    }),
    deleteSubscriptionPlan: builder.mutation({
      query: (subscriptionId) => {
        return {
          url: `subscriptionPlans/${subscriptionId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["subscriptionPlan"],
    }),
    getAllSubscriptionPlans: builder.query({
      query: (params?: { channelId?: string }) => {
        return {
          url: `subscription-plans`,
          method: "GET",
          params,
        };
      },
      providesTags: ["subscriptionPlan"],
    }),
    // New subscription-plans endpoints
    createSubscriptionPlanNew: builder.mutation({
      query: (body) => {
        return {
          url: `subscription-plans`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["subscriptionPlan"],
    }),
    updateSubscriptionPlanNew: builder.mutation({
      query: ({ planId, body }: { planId: string; body: any }) => {
        return {
          url: `subscription-plans/${planId}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["subscriptionPlan"],
    }),
    deleteSubscriptionPlanNew: builder.mutation({
      query: (subscriptionId: string) => {
        return {
          url: `subscription-plans/${subscriptionId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["subscriptionPlan"],
    }),
    getAllSubscriptionPlansNew: builder.query({
      query: (params?: { channelId?: string }) => {
        return {
          url: `subscription-plans`,
          method: "GET",
          params,
        };
      },
      providesTags: ["subscriptionPlan"],
    }),
    getSubscriptionPlanByIdNew: builder.query({
      query: (planId: string) => {
        return {
          url: `subscription-plans/${planId}`,
          method: "GET",
        };
      },
      providesTags: ["subscriptionPlan"],
    }),
    createCheckoutSession: builder.mutation({
      query: ({ body, idempotencyKey }: { body: any; idempotencyKey?: string }) => {
        return {
          url: `subscriptions/checkout/session`,
          method: "POST",
          body,
          headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        };
      },
    }),
  }),
});

export const {
  useCreateSubscriptionMutation,
  useGetMySubscriptionsQuery,
  useCancelSubscriptionMutation,
  useGetCurrentChannelSubscriptionQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useGetAllSubscriptionPlansQuery,
  useCreateSubscriptionPlanNewMutation,
  useUpdateSubscriptionPlanNewMutation,
  useDeleteSubscriptionPlanNewMutation,
  useGetAllSubscriptionPlansNewQuery,
  useGetSubscriptionPlanByIdNewQuery,
  useCreateCheckoutSessionMutation,
} = subscriptionApi;
