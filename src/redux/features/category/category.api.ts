import { TArgs } from "@/types";
import { baseApi } from "../../api/baseApi";

export interface CategoryQueryParams {
  limit?: number;
  page?: number;
  cursor?: string;
  search?: string;
  direction?: "next" | "prev" | "previous";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CategoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TCategory {
  _id: string;
  name: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  channelCount?: number;
}

export interface CategoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    type?: string;
    id?: string;
    attributes?: Record<string, unknown>;
    categories: TCategory[];
    pagination: CategoryPagination;
  };
}

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query<CategoryResponse, CategoryQueryParams | TArgs>({
      query: (args) => {
        const params = new URLSearchParams();

        // Handle both old TArgs format and new object format
        if (Array.isArray(args)) {
          // Old format: TArgs (array of {name, value})
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        } else if (args && typeof args === 'object') {
          // New format: object with direct properties
          Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value));
            }
          });
        }

        // Set default limit if not provided
        if (!params.has('limit')) {
          params.set('limit', '10');
        }

        return {
          url: `categories`,
          method: "GET",
          params,
        };
      },
      providesTags: ["category"],
    }),
    createCategory: builder.mutation({
      query: (body) => {
        return {
          url: `categories`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["category"],
    }),
    updateCategory: builder.mutation({
      query: ({ body, categoryId }) => {
        return {
          url: `categories/${categoryId}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["category"],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => {
        return {
          url: `categories/${categoryId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["category"],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useLazyGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
