import { baseApi } from "../../api/baseApi";

export type TInternalType = "terms" | "privacy" | "about";

export interface TInternal {
  _id?: string;
  id?: string;
  type: TInternalType;
  title?: string;
  description?: string;
}

interface TCreateInternalPayload {
  type: TInternalType;
  title: string;
  description: string;
}

interface TUpdateInternalPayload {
  internalId: string;
  body: {
    type: TInternalType;
    title?: string;
    description?: string;
  };
}

interface TInternalRaw {
  _id?: string;
  id?: string;
  type?: TInternalType;
  title?: string;
  description?: string;
}

interface TInternalApiResponse {
  data?: {
    attributes?: TInternalRaw;
  } & TInternalRaw;
  attributes?: TInternalRaw;
}

const normalizeInternal = (response: TInternalApiResponse): TInternal | null => {
  const data = response?.data?.attributes ?? response?.data ?? response?.attributes;
  const internal = Array.isArray(data) ? data[0] : data;

  if (!internal || typeof internal !== "object" || !internal.type) return null;

  return {
    _id: internal._id || internal.id,
    id: internal.id || internal._id,
    type: internal.type,
    title: internal.title ?? "",
    description: internal.description ?? "",
  };
};

const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUtility: builder.query<TInternal | null, TInternalType>({
      query: (type) => {
        return {
          url: `internals/${type}`,
          method: "GET",
        };
      },
      transformResponse: normalizeInternal,
      providesTags: ["settings"],
    }),
    createUtility: builder.mutation<{ message?: string }, TCreateInternalPayload>({
      query: ({ type, ...body }) => {
        return {
          url: `internals/${type}`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["settings"],
    }),
    updateUtility: builder.mutation<{ message?: string }, TUpdateInternalPayload>({
      query: ({ internalId, body }) => {
        return {
          url: `internals/${internalId}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["settings"],
    }),
  }),
});

export const {
  useGetUtilityQuery,
  useCreateUtilityMutation,
  useUpdateUtilityMutation,
} = settingsApi;
