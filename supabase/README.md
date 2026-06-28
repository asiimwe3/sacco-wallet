# SACCO Wallet — Supabase Setup Guide

## Step 1: Create Project
1. Go to https://supabase.com → New Project
2. Name: `sacco-wallet`
3. Password: (save it!)
4. Region: `Africa (South Africa)` — closest to Uganda

## Step 2: Run Migrations (in order)
Go to: Dashboard → SQL Editor → New Query

Run **001_initial_schema.sql** first — creates all tables, triggers, and RLS policies.
Run **002_rpc_functions.sql** second — creates server-side functions.

## Step 3: Get Your Keys
Dashboard → Settings → API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (admin only, never expose to client)

## Step 4: Add to Vercel
Go to: https://vercel.com/dashboard → sacco-wallet → Settings → Environment Variables

Add:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (for admin API routes only)
```

Then: Deployments → Redeploy (with new env vars)

## What the Triggers Do
- `on_auth_user_created` → When a farmer registers, instantly creates:
  - A `profiles` row with their name, language, role
  - A `wallets` row with zero balance (their digital ledger)
  - A `farm_records` row with GPS consent = false (awaiting their input)
- `trg_apply_savings` → When a deposit/withdrawal is recorded, the wallet balance is atomically updated in the same transaction
- `trg_apply_repayment` → When a loan repayment is made, the loan's `repaid_amount` and `status` auto-update

## Architecture
```
Farmer's Phone (offline)
     ↓ IndexedDB (local)
     ↓ sync when online
Supabase (cloud)
     ↓ triggers (instant)
profiles + wallets + farm_records
     ↓ RLS policies
Only that farmer can read their own data
```
