// ─── Shared view-state type used across prelaunch components ─────────────────
export type PrelaunchView = "hero" | "form" | "success";

// ─── Creator categories list ─────────────────────────────────────────────────
export const CREATOR_CATEGORIES = [
  "Music & Audio",
  "Comedy & Entertainment",
  "Beauty & Fashion",
  "Fitness & Wellness",
  "Food & Cooking",
  "Education & Tutorials",
  "Photography & Art",
  "Podcasting",
  "Gaming",
  "Travel & Lifestyle",
  "Tech & Innovation",
  "Spirituality & Motivation",
  "Sports",
  "Other",
] as const;

export type CreatorCategory = (typeof CREATOR_CATEGORIES)[number];

// ─── Countdown duration (seconds) ───────────────────────────────────────────
export const SUCCESS_COUNTDOWN_SEC = 10;
