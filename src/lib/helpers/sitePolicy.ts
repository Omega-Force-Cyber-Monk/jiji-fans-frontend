import { apiUrl } from "@/config";
import { cache } from "react";

export type TSitePolicyType = "about" | "terms" | "privacy";

export interface TSitePolicy {
  _id?: string;
  id?: string;
  type: TSitePolicyType;
  title: string;
  description: string;
}

type TSitePolicyApiNode = Partial<TSitePolicy> & {
  _id?: string;
  id?: string;
};

type TSitePolicyApiResponse = {
  data?: {
    attributes?: TSitePolicyApiNode;
  } & TSitePolicyApiNode;
  attributes?: TSitePolicyApiNode;
};

const normalizePolicy = (
  response: TSitePolicyApiResponse
): TSitePolicy | null => {
  const data = response?.data?.attributes ?? response?.data ?? response?.attributes;

  if (!data || typeof data !== "object" || !data.type) {
    return null;
  }

  return {
    _id: data._id || data.id,
    id: data.id || data._id,
    type: data.type,
    title: data.title ?? "",
    description: data.description ?? "",
  };
};

const buildApiUrl = (path: string) => {
  if (!apiUrl) {
    throw new Error("Server API URL is not configured.");
  }

  const normalizedBase = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
};

export const SITE_POLICY_META: Record<
  TSitePolicyType,
  { imageSrc: string; title: string; description: string }
> = {
  about: {
    imageSrc: "/static/utils/about.svg",
    title: "About Us",
    description:
      "Learn more about the people, values, and mission behind the platform.",
  },
  terms: {
    imageSrc: "/static/utils/terms.svg",
    title: "Terms and Conditions",
    description:
      "Review the latest terms that apply when using the platform and its services.",
  },
  privacy: {
    imageSrc: "/static/utils/privacy.svg",
    title: "Privacy Policy",
    description:
      "See how we collect, use, and protect your information across the platform.",
  },
};

export const getSitePolicy = cache(async (type: TSitePolicyType) => {
  const response = await fetch(buildApiUrl(`internals/${type}`), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as TSitePolicyApiResponse;
  return normalizePolicy(payload);
});
