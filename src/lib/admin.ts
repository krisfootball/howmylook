import { createSupabaseServerClient } from "@/lib/supabase-server";

function parseList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  const allowed = parseList(process.env.ADMIN_EMAILS);
  if (allowed.length === 0) {
    return false;
  }

  return allowed.includes(email.trim().toLowerCase());
}

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminEmail(user.email)) {
    return null;
  }

  return user;
}
