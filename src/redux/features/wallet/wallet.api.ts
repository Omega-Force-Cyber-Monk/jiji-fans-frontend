import { TArgs, TUniObject } from "@/types";
import { baseApi } from "../../api/baseApi";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

export interface TTransactionUser {
  _id: string;
  username: string;
  email: string;
}

export interface TTransactionMetadata {
  subscription?: string;
  commissionRate?: number;
}

export interface TTransaction {
  _id: string;
  wallet?: string;
  user?: TTransactionUser;
  transactionId?: string;
  referenceId?: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description?: string;
  reference?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: TTransactionMetadata;
  __v?: number;
  referenceModel?: string;
}

export interface TTransactionsByType {
  _id: string;
  statuses: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  totalCount: number;
  totalAmount: number;
}

export interface TWalletStats {
  balance: number;
  lifetimeTotalEarnings?: number;
  pendingWithdrawalAmount?: number;
  availableBalance?: number;
  pendingWithdrawals?: number;
  totalEarnings?: number;
  totalWithdrawals: number;
  currency?: string;
  totalTransactions: number;
  successfulTransactions?: number;
  pendingTransactions?: number;
  lastTransactionAt?: string;
  transactionsByType?: TTransactionsByType[];
}

export interface TPagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface TWalletTransactionsResponse {
  data: TTransaction[];
  pagination: TPagination;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface TMonthlyEarning {
  month: number;
  monthName: string;
  earnings: number;
  transactionCount: number;
}

export interface TMonthlyEarningsData {
  year: number;
  totalEarnings: number;
  totalTransactions: number;
  months: TMonthlyEarning[];
}

export interface TMonthlyEarningsResponse {
  currency: string;
  data: TMonthlyEarningsData;
}

export interface TWithdrawalRequest {
  _id: string;
  amount: number;
  description?: string;
  status: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt?: string;
  payoutScheduleId?: string;
  userId?: string;
  user?: {
    _id: string;
    username?: string;
    email?: string;
    profilePicture?: string;
    role?: string;
  };
}

export interface TWithdrawalRequestsResponse {
  results: TWithdrawalRequest[];
  totalResults?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}

const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Wallet Management
    getWalletStats: builder.query<TWalletStats, void>({
      query: () => {
        return {
          url: `wallets/my-wallet/stats`,
          method: "GET",
        };
      },
      transformResponse: (response: { data: Partial<TWalletStats> }) => {
        const payload = response?.data || {};
        return {
          balance: Number(payload.balance || 0),
          currency: payload.currency || "USD",
          totalWithdrawals: Number(payload.totalWithdrawals || 0),
          totalTransactions: Number(payload.totalTransactions || 0),
          totalEarnings: Number(
            payload.totalEarnings ?? payload.lifetimeTotalEarnings ?? 0,
          ),
          pendingWithdrawals: Number(
            payload.pendingWithdrawals ?? payload.pendingWithdrawalAmount ?? 0,
          ),
          lifetimeTotalEarnings: Number(payload.lifetimeTotalEarnings || 0),
          pendingWithdrawalAmount: Number(payload.pendingWithdrawalAmount || 0),
          availableBalance: Number(payload.availableBalance || 0),
          successfulTransactions: Number(payload.successfulTransactions || 0),
          pendingTransactions: Number(payload.pendingTransactions || 0),
          lastTransactionAt: payload.lastTransactionAt,
          transactionsByType: payload.transactionsByType || [],
        } as TWalletStats;
      },
      providesTags: ["wallet"],
    }),
    getWalletTransactions: builder.query<
      TWalletTransactionsResponse,
      TArgs | undefined
    >({
      query: (args) => {
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
      transformResponse: (response: { data: TUniObject }) => {
        const payload = response?.data || {};
        const normalizedData: TTransaction[] =
          payload?.results || payload?.data || payload?.items || [];

        const normalizedPagination: TPagination = payload?.pagination || {
          hasNextPage:
            typeof payload?.page === "number" &&
            typeof payload?.totalPages === "number"
              ? payload.page < payload.totalPages
              : false,
          hasPreviousPage:
            typeof payload?.page === "number" ? payload.page > 1 : false,
          nextCursor: payload?.nextCursor,
          previousCursor: payload?.previousCursor,
        };

        return {
          data: normalizedData,
          pagination: normalizedPagination,
          page: payload?.page,
          limit: payload?.limit,
          total: payload?.total,
          totalPages: payload?.totalPages,
        };
      },
      providesTags: ["wallet"],
    }),
    getMonthlyEarnings: builder.query<
      TMonthlyEarningsResponse,
      { year: number }
    >({
      query: ({ year }) => {
        return {
          url: `dashboard/earnings`,
          method: "GET",
          params: { year },
        };
      },
      transformResponse: (response: { data: TMonthlyEarningsResponse }) =>
        response.data,
      providesTags: ["wallet"],
    }),
    // Withdraw Management
    requestWithdraw: builder.mutation({
      query: (body) => {
        return {
          url: `withdrawal-requests`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["wallet", "withdraw"],
    }),
    myWithdrawalRequests: builder.query<
      TWithdrawalRequestsResponse,
      TArgs | undefined
    >({
      query: (args) => {
        const params = buildQueryParams(args);
        return {
          url: `withdrawal-requests/my-requests`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: { data: TWithdrawalRequestsResponse }) =>
        response.data,
      providesTags: ["wallet", "withdraw"],
    }),
    // admin api
    getAdminTotalTransitions: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `transactions`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => response,
      providesTags: ["wallet"],
    }),
    adminWithdrawals: builder.query({
      query: (args: TArgs) => {
        const params = buildQueryParams(args);
        return {
          url: `withdrawal-requests`,
          method: "GET",
          params,
        };
      },
      providesTags: ["wallet"],
    }),
    requestProcessing: builder.mutation({
      query: ({ id, body }) => {
        return {
          url: `withdrawal-requests/${id}/process`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["wallet", "withdraw"],
    }),
  }),
});

export const {
  useGetWalletStatsQuery,
  useGetWalletTransactionsQuery,
  useGetMonthlyEarningsQuery,
  useRequestWithdrawMutation,
  useMyWithdrawalRequestsQuery,
  useGetAdminTotalTransitionsQuery,
  useAdminWithdrawalsQuery,
  useRequestProcessingMutation,
} = walletApi;
