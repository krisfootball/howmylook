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
};

export type DatabasePost = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  yes_count: number;
  no_count: number;
  is_active: boolean;
  post_images?: {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
};
