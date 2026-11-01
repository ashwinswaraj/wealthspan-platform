/**
 * Seeds the first Wealthspan super-admin account.
 *
 * Usage (never run against production without an explicit approval):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... tsx infrastructure/seed/seed-admin.ts
 *
 * The script is idempotent: an existing user with the same email is updated
 * to carry the `super_admin` role instead of being recreated.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const adminEmail = process.env["ADMIN_EMAIL"];
const adminPassword = process.env["ADMIN_PASSWORD"];

if (!supabaseUrl || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error(
    "Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD are all required.",
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users.find((u) => u.email?.toLowerCase() === adminEmail!.toLowerCase());

  if (found) {
    const { error } = await admin.auth.admin.updateUserById(found.id, {
      app_metadata: { ...found.app_metadata, role: "super_admin" },
    });
    if (error) throw error;
    console.log(`Updated existing user ${adminEmail} → super_admin (${found.id})`);
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: adminEmail!,
    password: adminPassword!,
    email_confirm: true,
    app_metadata: { role: "super_admin" },
  });
  if (error) throw error;
  console.log(`Created super admin ${adminEmail} (${data.user?.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
