import { createServiceClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

export const ADMIN_EMAIL = "admin@zippr.ink";

/** Service role ile rol okur; admin@zippr.ink için super_admin garanti eder. */
export async function resolveUserRole(
  userId: string,
  email?: string | null
): Promise<UserRole> {
  try {
    const admin = createServiceClient();
    const normalizedEmail = email?.trim().toLowerCase();

    let { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle<{ role: UserRole }>();

    if (!profile && normalizedEmail === ADMIN_EMAIL) {
      await admin.from("profiles").upsert(
        {
          id: userId,
          email: ADMIN_EMAIL,
          full_name: "Admin",
          role: "super_admin",
          plan_type: "professional",
          storage_limit: 1099511627776,
        },
        { onConflict: "id" }
      );
      return "super_admin";
    }

    if (normalizedEmail === ADMIN_EMAIL && profile?.role !== "super_admin") {
      await admin
        .from("profiles")
        .update({
          role: "super_admin",
          full_name: "Admin",
          plan_type: "professional",
          storage_limit: 1099511627776,
        })
        .eq("id", userId);
      return "super_admin";
    }

    return profile?.role === "super_admin" ? "super_admin" : "user";
  } catch {
    return "user";
  }
}

export async function isSuperAdmin(
  userId: string,
  email?: string | null
): Promise<boolean> {
  return (await resolveUserRole(userId, email)) === "super_admin";
}
