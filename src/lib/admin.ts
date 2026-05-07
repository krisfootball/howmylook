import { createSupabaseServerClient } from "@/lib/supabase-server";

export function parseAdminList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  const allowed = parseAdminList(process.env.ADMIN_EMAILS);
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

export async function getAdminAccessDebug() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const allowedEmails = parseAdminList(process.env.ADMIN_EMAILS);
  const signedInEmail = user?.email?.trim().toLowerCase() ?? null;

  return {
    signedIn: Boolean(user) && !error,
    signedInEmail,
    allowedEmails,
    isAllowed: Boolean(signedInEmail && allowedEmails.includes(signedInEmail)),
  };
}
