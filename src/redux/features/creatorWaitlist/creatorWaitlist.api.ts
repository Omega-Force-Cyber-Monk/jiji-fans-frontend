import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";

export interface TCreatorWaitlistPayload {
    name: string;
    email: string;
    whatsapp: string;
    categoryId: string;
}

export interface TCreatorWaitlistEntry {
    _id: string;
    name: string;
    email?: string;
    whatsapp?: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatorWaitlistQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    name?: string;
    email?: string;
    whatsapp?: string;
    categoryId?: string;
}

export interface TCreatorWaitlistPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreatorWaitlistResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data: {
        type?: string;
        id?: string;
        attributes?: Record<string, unknown>;
        waitlist: TCreatorWaitlistEntry[];
        pagination: TCreatorWaitlistPagination;
    };
}

export interface JoinCreatorWaitlistResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data?: unknown;
}

const creatorWaitlistApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCreatorWaitlist: builder.query<CreatorWaitlistResponse, CreatorWaitlistQueryParams | TArgs>({
            query: (args) => {
                const params = new URLSearchParams();

                if (Array.isArray(args)) {
                    args.forEach((item) => {
                        params.append(item.name, item.value);
                    });
                } else if (args && typeof args === "object") {
                    Object.entries(args).forEach(([key, value]) => {
                        if (value !== undefined && value !== null) {
                            params.append(key, String(value));
                        }
                    });
                }

                // Set default page and limit if not provided in request params
                if (!params.has("page")) {
                    params.set("page", "1");
                }
                if (!params.has("limit")) {
                    params.set("limit", "10");
                }

                return {
                    url: "creator-waitlist",
                    method: "GET",
                    params,
                };
            },
            providesTags: ["creatorWaitlist"],
        }),
        joinCreatorWaitlist: builder.mutation<JoinCreatorWaitlistResponse, TCreatorWaitlistPayload>({
            query: (body) => ({
                url: "creator-waitlist/join",
                method: "POST",
                body,
            }),
            invalidatesTags: ["creatorWaitlist"],
        }),
    }),
});

export const {
    useGetCreatorWaitlistQuery,
    useLazyGetCreatorWaitlistQuery,
    useJoinCreatorWaitlistMutation,
} = creatorWaitlistApi;
