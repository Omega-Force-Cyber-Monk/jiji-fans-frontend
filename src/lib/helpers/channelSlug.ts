const RESERVED_CHANNEL_SLUGS = new Set([
  "admin",
  "settings",
  "login",
  "logout",
  "auth",
  "dashboard",
  "verification",
  "overview",
  "channels",
  "memberships",
  "membership",
  "messages",
  "notifications",
  "subscriber",
  "mychannel",
  "profile",
  "wallet",
  "upload-content",
  "payment",
  "account-suspended",
  "sign-in",
  "sign-up",
  "forget-pass",
  "reset-pass",
  "verify-email",
  "account-suspended",
  "channel-rejected",
  "channel-suspended",
  "channel-under-review",
  "unauthorized",
  "about-us",
  "privacy",
  "terms",
]);

const slugify = (value: string) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const createChannelSlug = (value?: string | null) =>
  value ? slugify(value) : "";

export const isReservedChannelSlug = (value?: string | null) =>
  Boolean(value && RESERVED_CHANNEL_SLUGS.has(slugify(value)));

export const resolveChannelSlug = (channel?: {
  slug?: string | null;
  name?: string | null;
}) => {
  const rawSlug = channel?.slug?.trim();
  const fallbackSlug = createChannelSlug(channel?.name || "");
  const slug = rawSlug ? slugify(rawSlug) : fallbackSlug;

  return slug;
};

export const getChannelShareUrl = (
  channel?: {
    slug?: string | null;
    name?: string | null;
  },
  origin?: string
) => {
  const slug = resolveChannelSlug(channel);
  if (!slug) {
    return "";
  }

  const baseUrl = origin?.replace(/\/+$/, "") || "";
  return baseUrl ? `${baseUrl}/${slug}` : `/${slug}`;
};
