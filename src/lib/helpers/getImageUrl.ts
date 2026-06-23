import { imageUrl as baseImageUrl } from "@/config";

/**
 * Formats an image URL by prefixing it with the base image URL if it's a relative path.
 * Handles cases where the URL is already absolute or starts with "blob:".
 */
export const getImageUrl = (url?: string): string => {
  if (!url) return "";
  
  // If it's a blob URL (for previews), return it as is
  if (url.startsWith("blob:")) return url;
  
  // If it's already an absolute URL (starts with http or https), return it as is
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  
  // If baseImageUrl is not available, return the url as is if it's absolute-like
  if (!baseImageUrl || baseImageUrl === "undefined") {
    return url.startsWith("/") ? url : `/${url}`;
  }

  // If it's a path starting with "uploads/", prefix it with the base image URL
  if (url.startsWith("uploads/")) {
    return `${baseImageUrl}/${url}`;
  }
  
  // For other relative paths, also prefix with base URL if it doesn't start with /
  if (!url.startsWith("/")) {
    return `${baseImageUrl}/${url}`;
  }

  return url;
};
