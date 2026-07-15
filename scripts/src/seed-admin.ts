/**
 * Admin environment validator.
 *
 * The Yastar internal admin dashboard (/admin) is protected by the
 * ADMIN_PASSWORD environment secret. There is no database row for the admin —
 * authentication is purely secret-based.
 *
 * This script validates that the required secrets are in place before you
 * launch the app, so you catch missing config early rather than at runtime.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed:admin
 *
 * How to create owner accounts:
 *   1. Set ADMIN_PASSWORD in Replit Secrets (a strong, unique password of
 *      your choosing — never commit it to source code).
 *   2. Open /admin in the browser and log in with that password.
 *   3. Click "Buat Akun" to create a subscriber account by email and tier.
 *   4. Share the app URL and the registered email with the subscriber — they
 *      log in at /sign-in and the DB record auto-links on first login.
 */

const missing: string[] = [];

const required = [
  "ADMIN_PASSWORD",
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
];

for (const key of required) {
  if (!process.env[key]) {
    missing.push(key);
  }
}

if (missing.length > 0) {
  console.error("❌  Missing required environment secrets:");
  for (const key of missing) {
    console.error(`    - ${key}`);
  }
  console.error(
    "\nSet these in Replit Secrets before starting the application.",
  );
  process.exitCode = 1;
} else {
  console.log("✔  All required environment secrets are set.");
  console.log(
    "\nAdmin dashboard: open /admin and log in with the ADMIN_PASSWORD secret.",
  );
  console.log(
    "Create subscriber accounts from the dashboard — no database seeding required.",
  );
}
