import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const nowIso = new Date().toISOString();

const { data: expiredPosts, error: postsError } = await supabase
  .from("posts")
  .select("id,user_id,image_url,post_images(image_url)")
  .eq("is_active", true)
  .eq("keep_forever", false)
  .lt("expires_at", nowIso);

if (postsError) {
  console.error("Failed to load expired posts:", postsError.message);
  process.exit(1);
}

if (!expiredPosts || expiredPosts.length === 0) {
  console.log("No expired non-kept posts to delete.");
  process.exit(0);
}

const storagePaths = [];

for (const post of expiredPosts) {
  const imageUrls = [post.image_url, ...(post.post_images ?? []).map((image) => image.image_url)].filter(Boolean);

  for (const imageUrl of imageUrls) {
    try {
      const url = new URL(imageUrl);
      const marker = "/storage/v1/object/public/post-images/";
      const index = url.pathname.indexOf(marker);

      if (index >= 0) {
        const relativePath = decodeURIComponent(url.pathname.slice(index + marker.length));
        storagePaths.push(relativePath);
      }
    } catch {
      // ignore non-URL demo/seed paths
    }
  }
}

const uniqueStoragePaths = Array.from(new Set(storagePaths));

if (uniqueStoragePaths.length > 0) {
  const { error: storageError } = await supabase.storage.from("post-images").remove(uniqueStoragePaths);

  if (storageError) {
    console.error("Failed to delete storage files:", storageError.message);
    process.exit(1);
  }
}

const postIds = expiredPosts.map((post) => post.id);
const { error: deleteError } = await supabase.from("posts").delete().in("id", postIds);

if (deleteError) {
  console.error("Failed to delete expired posts:", deleteError.message);
  process.exit(1);
}

console.log(`Deleted ${postIds.length} expired non-kept posts and ${uniqueStoragePaths.length} storage files.`);
