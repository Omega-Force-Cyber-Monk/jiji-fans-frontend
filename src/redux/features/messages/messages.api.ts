import { baseApi } from "../../api/baseApi";
import { TArgs } from "@/types";
import { buildQueryParams } from "@/lib/helpers/paramsQueryBuilder";

export interface TParticipant {
  _id: string;
  username: string;
  avatar?: string;
  email?: string;
  role: string;
  channel?: {
    name: string | null;
    avatar: string | null;
  };
  joinedAt?: string;
}

export interface TConversation {
  _id: string;
  conversationId: string;
  creatorId: string;
  updatedAt: string;
  conversationType: "PRIVATE" | "GROUP";
  avatar?: string;
  conversationName?: string;
  title?: string;
  participants: TParticipant[];
  participantCount: number;
  unreadCount: number;
  priorityScore?: number;
  otherUser?: {
    _id: string;
    username: string;
    avatar?: string;
    email?: string;
    role: string;
    channel: {
      name: string | null;
      avatar: string | null;
    };
  };
}

export interface TMessage {
  _id: string;
  senderId: string | {
    _id: string;
    username: string;
    avatar?: string;
    email?: string;
    role: string;
    channel?: {
      name: string | null;
      avatar: string | null;
    };
  };
  conversationId: string;
  text?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  status?: "sending" | "sent" | "error";
  localId?: string;
}

export interface TConversationResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface TPaginatedResponse<T> {
  result?: T[];
  results?: T[];
  page: number;
  limit: number;
  totalResult?: number;
  totalResults?: number;
  totalPages: number;
}

const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create a conversation (PRIVATE or GROUP)
    createConversation: builder.mutation<
      TConversationResponse<{ conversationId: string; messages: TPaginatedResponse<TMessage> }>,
      { conversationType: "PRIVATE" | "GROUP"; participants: string[]; title?: string; avatar?: string }
    >({
      query: (body) => ({
        url: "conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["conversation"],
    }),

    // 2. Get authenticated user's conversations (Mine endpoint)
    getConversationsMine: builder.query<
      TConversationResponse<TPaginatedResponse<TConversation>>,
      { userId: string; page?: number; limit?: number; sortBy?: string; sortOrder?: string; search?: string }
    >({
      query: ({ userId, ...params }) => ({
        url: `conversations/mine/${userId}`,
        method: "GET",
        params,
      }),
      providesTags: ["conversation"],
    }),

    // 3. Get priority inbox for Creator and Admin
    getConversationsPriority: builder.query<
      TConversationResponse<TPaginatedResponse<TConversation>>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "conversations/priority",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["conversation"],
    }),

    // 4. Get authenticated user's conversations (broader list view)
    getConversations: builder.query<
      TConversationResponse<TPaginatedResponse<TConversation>>,
      { page?: number; limit?: number; sortBy?: string; sortOrder?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "conversations",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["conversation"],
    }),

    // 5. Get conversation details
    getConversationDetails: builder.query<TConversationResponse<TConversation>, string>({
      query: (conversationId) => ({
        url: `conversations/${conversationId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [{ type: "conversation" as const, id: arg }],
    }),

    // 6. Update group metadata
    updateConversation: builder.mutation<
      TConversationResponse<TConversation>,
      { conversationId: string; title?: string; avatar?: string }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `conversations/${conversationId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "conversation",
        { type: "conversation" as const, id: conversationId },
      ],
    }),

    // 7. Add participant to a group
    addParticipant: builder.mutation<
      TConversationResponse<{ conversationId: string; participant: TParticipant }>,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, userId }) => ({
        url: `conversations/${conversationId}/participants`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "conversation",
        { type: "conversation" as const, id: conversationId },
      ],
    }),

    // 8. Remove participant from a group
    removeParticipant: builder.mutation<
      TConversationResponse<{ conversationId: string; participantId: string }>,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, userId }) => ({
        url: `conversations/${conversationId}/participants/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "conversation",
        { type: "conversation" as const, id: conversationId },
      ],
    }),

    // 9. Leave a group conversation
    leaveConversation: builder.mutation<
      TConversationResponse<{ conversationDeleted: boolean; conversationId: string; conversation?: TConversation }>,
      string
    >({
      query: (conversationId) => ({
        url: `conversations/${conversationId}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["conversation"],
    }),

    // 10. Mark conversation as read
    markAsRead: builder.mutation<
      TConversationResponse<{ conversationId: string; unreadCount: number }>,
      string
    >({
      query: (conversationId) => ({
        url: `conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, arg) => [
        "conversation",
        { type: "conversation" as const, id: arg },
      ],
    }),

    // 11. Send a message
    sendMessage: builder.mutation<
      TConversationResponse<TMessage>,
      { conversationId: string; text?: string; attachments?: string[] }
    >({
      query: (body) => ({
        url: "messages",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "conversation",
        { type: "message" as const, id: conversationId },
      ],
    }),

    // 12. Get messages for a conversation
    getMessages: builder.query<
      TConversationResponse<TPaginatedResponse<TMessage>>,
      { conversationId: string; page?: number; limit?: number; sortBy?: string; sortOrder?: string; searchTerm?: string }
    >({
      query: ({ conversationId, ...params }) => ({
        url: `messages/${conversationId}`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, { conversationId }) => [
        { type: "message" as const, id: conversationId },
      ],
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useGetConversationsMineQuery,
  useGetConversationsPriorityQuery,
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetConversationDetailsQuery,
  useLazyGetConversationDetailsQuery,
  useUpdateConversationMutation,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  useLeaveConversationMutation,
  useMarkAsReadMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
} = messagesApi;
