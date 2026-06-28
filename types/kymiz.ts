// ============================================================
// KYMIZ — Core business types
// ============================================================

export type Platform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "tiktok";

export type PostStatus = "draft" | "scheduled" | "published" | "failed";

// ────────────────────────────────────────────────────────────
// Workspace
// ────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Social Account
// ────────────────────────────────────────────────────────────

export interface SocialAccount {
  id: string;
  workspace_id: string;
  platform: Platform;
  account_name: string;
  account_id: string | null;
  access_token: string | null;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Post
// ────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  workspace_id: string;
  user_id: string;
  content: string;
  platforms: Platform[];
  scheduled_at: string | null;
  status: PostStatus;
  image_url: string | null;
  ai_generated: boolean;
  ai_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  workspaceId: string;
  content: string;
  platforms: Platform[];
  scheduledAt?: string;
  status: PostStatus;
  imageUrl?: string;
  aiGenerated?: boolean;
  aiPrompt?: string;
}

export interface UpdatePostInput {
  content?: string;
  platforms?: Platform[];
  scheduledAt?: string | null;
  status?: PostStatus;
  imageUrl?: string | null;
  aiGenerated?: boolean;
  aiPrompt?: string | null;
}

// ────────────────────────────────────────────────────────────
// Analytics
// ────────────────────────────────────────────────────────────

export interface Analytics {
  id: string;
  post_id: string;
  platform: Platform;
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
  recorded_at: string;
}

export interface AnalyticsTotals {
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
}

// ────────────────────────────────────────────────────────────
// Composite types
// ────────────────────────────────────────────────────────────

export interface PostWithAnalytics extends Post {
  analytics: Analytics[];
  totalImpressions: number;
  totalLikes: number;
  totalShares: number;
  totalClicks: number;
}

// ────────────────────────────────────────────────────────────
// Platform metadata (UI helpers)
// ────────────────────────────────────────────────────────────

export interface PlatformMeta {
  id: Platform;
  label: string;
  color: string;
  charLimit: number;
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  instagram: { id: "instagram", label: "Instagram", color: "#E1306C", charLimit: 2200 },
  facebook:  { id: "facebook",  label: "Facebook",  color: "#1877F2", charLimit: 63206 },
  twitter:   { id: "twitter",   label: "X / Twitter", color: "#000000", charLimit: 280 },
  linkedin:  { id: "linkedin",  label: "LinkedIn",  color: "#0A66C2", charLimit: 3000 },
  tiktok:    { id: "tiktok",    label: "TikTok",    color: "#FF0050", charLimit: 2200 },
};

// ────────────────────────────────────────────────────────────
// Server action result
// ────────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data?: T; error?: never }
  | { success?: never; error: string; data?: never };
