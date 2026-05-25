/**
 * Creates super admin user in Supabase.
 * Usage: node scripts/create-admin.mjs
 * Reads .env.local from project root.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const content = readFileSync(join(root, ".env.local"), "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const ADMIN_EMAIL = "admin@zippr.ink";
const ADMIN_PASSWORD = "zippr2026e";

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);

  let userId;

  if (existing) {
    userId = existing.id;
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });
    if (error) {
      console.error("createUser error:", error);
      throw error;
    }
    console.log("Updated existing user password:", ADMIN_EMAIL);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });
    if (error) {
      console.error("createUser error:", error);
      throw error;
    }
    userId = data.user.id;
    console.log("Created user:", ADMIN_EMAIL);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
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

  if (profileError) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "super_admin",
        full_name: "Admin",
        email: ADMIN_EMAIL,
      })
      .eq("id", userId);

    if (updateError) throw updateError;
    console.log("Profile updated to super_admin");
  } else {
    console.log("Profile set to super_admin");
  }

  console.log("\n--- Admin giriş (local) ---");
  console.log("URL:      http://localhost:3000/admin/login");
  console.log("E-posta: ", ADMIN_EMAIL);
  console.log("Şifre:   ", ADMIN_PASSWORD);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
