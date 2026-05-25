import { createClient } from "@/lib/supabase/client";

export async function getUploadAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }

  const { data: refreshed } = await supabase.auth.refreshSession();
  if (refreshed.session?.access_token) {
    return { Authorization: `Bearer ${refreshed.session.access_token}` };
  }

  return {};
}
