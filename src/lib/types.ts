export type AppStep = "auth" | "username" | "rating" | "unlocked";

export type Profile = {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  total_yes_given: number;
  total_no_given: number;
  unlock_votes_completed?: number;
  login_rating_votes_completed?: number;
};

export type Follow = {
  follower_id: string;
  following_id: string;
  created_at?: string;
  notifications_enabled?: boolean;
  notifications_enabled_at?: string | null;
};

export type PushSubscriptionRecord = {
  endpoint: string;
  user_id: string;
  p256dh: string;
  auth: string;
  user_agent?: string | null;
  last_seen_at?: string;
  created_at?: string;
};

export type ModerationStatus = "approved" | "hidden" | "deleted" | "pending";

export type DatabasePost = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  yes_count: number;
  no_count: number;
  is_active: boolean;
  moderation_status?: ModerationStatus;
  moderation_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  admin_alert_sent_at?: string | null;
  expires_at?: string;
  keep_forever?: boolean;
  post_images?: {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
};
