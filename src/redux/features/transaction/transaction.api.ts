import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransactions: builder.query({
      query: (args: TArgs) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: `wallets/my-wallet/transactions`,
          method: "GET",
          params,
        };
      },
      providesTags: ["transaction"],
    }),
    getPayoutForClient: builder.query({
      query: () => ({
        url: `payout-schedules/check-availability`,
        method: "GET",
      }),
      providesTags: ["payout"],
    }),
    getPayoutSchedules: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `payout-schedules`,
          method: "GET",
          params,
        };
      },
      providesTags: ["payout"],
    }),
    createPayoutSchedule: builder.mutation({
      query: (data) => ({
        url: `payout-schedules`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["payout"],
    }),
    updatePayoutScheduleStatus: builder.mutation({
      query: ({ scheduleId, status }: { scheduleId: string; status: string }) => ({
        url: `payout-schedules/${scheduleId}/status`,
        method: "PATCH",
        params: { status },
      }),
      invalidatesTags: ["payout"],
    }),
    updatePayoutSchedule: builder.mutation({
      query: ({ scheduleId, data }: { scheduleId: string; data: any }) => ({
        url: `payout-schedules/${scheduleId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["payout"],
    }),
  }),
});

export const {
  useGetAllTransactionsQuery,
  useGetPayoutForClientQuery,
  useGetPayoutSchedulesQuery,
  useCreatePayoutScheduleMutation,
  useUpdatePayoutScheduleStatusMutation,
  useUpdatePayoutScheduleMutation,
} = transactionApi;
