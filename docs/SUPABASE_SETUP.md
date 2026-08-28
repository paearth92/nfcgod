# NFCPlate Supabase Setup Guide

This document covers the database setup, environment configuration, and first-admin promotion for the NFCPlate NFC/QR product system.

## 1. Environment Variables

The following environment variables are required. They are pre-populated in the hosted environment. For local development, copy `.env.example` to `.env` and fill in the values.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://nfcplate.com
```

**Important:** `SUPABASE_SERVICE_ROLE_KEY` must NEVER be imported in client-side code. It is only used by `lib/supabase/admin.ts`, which is server-only.

## 2. Database Schema

The database migration has already been applied via the Supabase MCP tool. The migration creates four tables:

- **profiles** — extends `auth.users` with `role` (customer/admin), `full_name`, `business_name`
- **batches** — groups of generated codes created by admins
- **codes** — individual NFC/QR codes with `status` (unclaimed/active/disabled), `owner_id`, `destination_url`
- **code_events** — audit log for scans, activations, redirects, and destination updates

### Row Level Security (RLS)

RLS is enabled on all tables:
- Customers can only read and update their own codes and profile
- Admins can manage all data
- Public code lookups happen through SECURITY DEFINER RPCs (`lookup_code`, `record_code_event`) that expose only the minimal information needed
- The `claim_code` RPC uses `SELECT ... FOR UPDATE` to prevent race conditions between two users claiming the same code

### Key RPCs

- `lookup_code(code)` — public, returns code/status/destination_url for redirect/activation
- `claim_code(code, url)` — authenticated, atomically claims an unclaimed code
- `update_destination(code, url)` — authenticated, updates destination for an owned code
- `record_code_event(code, event_type, referrer, user_agent)` — public, logs scan/redirect events
- `generate_batch_codes(name, prefix, notes, quantity)` — admin-only, generates a batch of codes

## 3. Authentication

NFCPlate uses Supabase email/password authentication. The auth flow includes:

- `/auth/sign-in` — Sign in with email and password
- `/auth/sign-up` — Create a new account (full name, business name, email, password)
- `/auth/forgot-password` — Request a password reset email
- `/auth/update-password` — Set a new password after reset
- `/auth/callback` — Handles the OAuth callback after email confirmation
- `/auth/sign-out` — POST route that signs out and redirects to home

Email confirmation is OFF by default. Sessions are managed through cookies via `@supabase/ssr`.

The middleware (`middleware.ts`) refreshes the session on every request and protects `/dashboard` and `/admin` routes, redirecting unauthenticated users to `/auth/sign-in`.

## 4. Promote the First Admin

After creating your first account via `/auth/sign-up`, you need to grant admin access. Run this SQL in the Supabase Dashboard SQL Editor:

```sql
UPDATE profiles SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

Replace `your-email@example.com` with the email you used to sign up.

After running this query, the user will have admin access. They can then access `/admin` to manage batches and codes.

## 5. Generating the First Batch of Codes

Once you have admin access:

1. Navigate to `/admin`
2. Click "Batches" in the sidebar
3. Click "Create Batch"
4. Enter a batch name (e.g., "Initial Production Run"), an optional prefix, and a quantity (1–5000)
5. Click "Generate"

The system will generate cryptographically random codes using the charset `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (no 0, O, 1, I, or L) and format them as `XXXX-XXXX`.

Each code gets a permanent URL in the form `https://nfcplate.com/c/XXXX-XXXX`.

## 6. How the Code System Works

1. An admin generates a batch of codes — each code starts as `unclaimed`
2. A customer receives a physical NFCPlate product with a code printed on it
3. The customer visits `nfcplate.com/c/XXXX-XXXX` (by tapping the NFC tag or scanning the QR code)
4. If the code is `unclaimed`, they are redirected to the activation page
5. The customer signs in (or creates an account), enters their destination URL (e.g., their Google review page), and activates the code
6. The code becomes `active` and all future taps/scans redirect directly to the saved destination
7. The customer can update the destination URL from their dashboard at any time — without rewriting the NFC tag or reprinting the QR code

## 7. Verification Checklist

After setup, verify:

- [ ] Sign up works at `/auth/sign-up`
- [ ] Sign in works at `/auth/sign-in`
- [ ] The first user has been promoted to admin via SQL
- [ ] `/admin` is accessible to the admin user
- [ ] A batch of codes can be generated
- [ ] An unclaimed code at `/c/XXXX-XXXX` redirects to `/activate/XXXX-XXXX`
- [ ] Activation works for a signed-in user
- [ ] After activation, `/c/XXXX-XXXX` redirects to the destination URL
- [ ] The customer dashboard at `/dashboard` shows the activated code
- [ ] The destination can be updated from the dashboard
- [ ] CSV export works for a batch
