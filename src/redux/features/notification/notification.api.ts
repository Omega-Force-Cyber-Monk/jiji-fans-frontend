import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";

export interface TNotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: "error" | "success" | "warning" | "info" | "promotion";
  category: "system" | "user" | "subscription" | "content" | "payment" | "social";
  priority: "low" | "medium" | "high";
  isDelivered: boolean;
  deliveredAt?: string;
  deliveryMethod: "push" | "email" | "sms" | "in-app";
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  scheduleAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  shouldDeliverNow: boolean;
  id: string;
}

export interface TNotificationPagination {
  nextCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    notifications: TNotification[];
    pagination: TNotificationPagination;
  };
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query<NotificationsResponse, TArgs | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: `notifications`,
          method: "GET",
          params,
        };
      },
      providesTags: ["notification"],
    }),
    getNotificationDetails: builder.query({
      query: (notificationId) => {
        return {
          url: `notifications/${notificationId}/details`,
          method: "GET",
        };
      },
      providesTags: ["notification"],
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => {
        return {
          url: `notifications/${notificationId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["notification"],
    }),
  }),
});

export const {
  useGetAllNotificationsQuery,
  useGetNotificationDetailsQuery,
  useDeleteNotificationMutation,
} = notificationApi;
