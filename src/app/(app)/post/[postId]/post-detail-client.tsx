"use client";

import { useEffect, useMemo, useState } from "react";
import { PostView } from "@/components/post-view";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type PostDetailClientProps = {
  images: string[];
  caption: string;
  yesCount: number;
  noCount: number;
  authorId?: string | null;
  authorName: string;
  postId: string;
  ownerId?: string | null;
  isKeptForever?: boolean;
  backHref?: string;
  backLabel?: string;
  showPostedBadge?: boolean;
};

export default function PostDetailClient(props: PostDetailClientProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isOwnPost, setIsOwnPost] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      setIsOwnPost(Boolean(user?.id && props.ownerId && user.id === props.ownerId));
    }

    void load();

    return () => {
      active = false;
    };
  }, [props.ownerId, supabase]);

  return <PostView {...props} isOwnPost={isOwnPost} showPostedBadge={props.showPostedBadge} />;
}
