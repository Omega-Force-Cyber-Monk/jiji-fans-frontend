const YOUTUBE_VIDEO_ID_PATTERN =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtube\.com\/.*[?&]v=)([^#&?/\s]{6,})/i;

export const getYouTubeVideoId = (url?: string | null): string | null => {
  if (!url) return null;

  const match = url.match(YOUTUBE_VIDEO_ID_PATTERN);
  return match?.[1] ?? null;
};

export const getYouTubeThumbnailUrl = (url?: string | null): string => {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return "/static/demo-image.jpg";
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};
