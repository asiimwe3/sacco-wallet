-- ============================================================
-- SACCO Wallet — Full Database Schema
-- Kyenjojo Farmers SACCO, Uganda
-- Run this in Supabase SQL Editor (in order)
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('farmer', 'admin', 'field_officer');
CREATE TYPE loan_status AS ENUM ('pending', 'approved', 'active', 'repaid', 'defaulted', 'rejected');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'loan_disbursement', 'loan_repayment', 'interest', 'fee', 'share_purchase');
CREATE TYPE language_pref AS ENUM ('runyoro', 'luganda', 'english');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number    TEXT UNIQUE,
  full_name       TEXT NOT NULL DEFAULT 'SACCO Member',
  role            user_role NOT NULL DEFAULT 'farmer',
  preferred_language language_pref NOT NULL DEFAULT 'runyoro',
  village         TEXT,
  district        TEXT DEFAULT 'Kyenjojo',
  national_id     TEXT,
  date_of_birth   DATE,
  gender          TEXT,
  next_of_kin     TEXT,
  next_of_kin_phone TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  joined_sacco_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WALLETS (one per user — the digital ledger)
-- ============================================================
CREATE TABLE public.wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance         NUMERIC(15,2) NOT NULL DEFAULT 0.00,  -- total available balance
  savings_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,  -- savings pot
  shares_owned    INTEGER NOT NULL DEFAULT 0,            -- SACCO shares (1 share = UGX 10,000)
  locked_amount   NUMERIC(15,2) NOT NULL DEFAULT 0.00,  -- held as collateral
  currency        TEXT NOT NULL DEFAULT 'UGX',
  last_txn_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_balance CHECK (balance >= 0),
  CONSTRAINT positive_savings CHECK (savings_balance >= 0)
);

-- ============================================================
-- FARM RECORDS (linked to profile, supports GPS)
-- ============================================================
CREATE TABLE public.farm_records (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id             UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_size_acres       NUMERIC(8,2),
  crops                 TEXT[] DEFAULT '{}',
  gps_lat               NUMERIC(10,6),
  gps_lng               NUMERIC(10,6),
  gps_captured_at       TIMESTAMPTZ,
  has_consented_to_gps  BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status   verification_status DEFAULT 'pending',
  verified_by           UUID REFERENCES public.profiles(id),
  verified_at           TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVINGS TRANSACTIONS
-- ============================================================
CREATE TABLE public.savings_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID NOT NULL REFERENCES public.wallets(id),
  farmer_id       UUID NOT NULL REFERENCES public.profiles(id),
  type            transaction_type NOT NULL,
  amount          NUMERIC(15,2) NOT NULL,
  balance_after   NUMERIC(15,2) NOT NULL,
  reference_id    TEXT UNIQUE,        -- for offline sync deduplication
  note            TEXT,
  processed_by    UUID REFERENCES public.profiles(id),  -- admin who approved
  synced_from_offline BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ============================================================
-- LOANS
-- ============================================================
CREATE TABLE public.loans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id         UUID NOT NULL REFERENCES public.profiles(id),
  amount            NUMERIC(15,2) NOT NULL,
  amount_disbursed  NUMERIC(15,2) DEFAULT 0.00,
  interest_rate     NUMERIC(5,2) NOT NULL DEFAULT 12.00,  -- % per annum
  duration_months   INTEGER NOT NULL DEFAULT 6,
  purpose           TEXT NOT NULL,
  status            loan_status NOT NULL DEFAULT 'pending',
  repaid_amount     NUMERIC(15,2) DEFAULT 0.00,
  due_date          DATE,
  disbursed_at      TIMESTAMPTZ,
  approved_by       UUID REFERENCES public.profiles(id),
  rejected_reason   TEXT,
  collateral_notes  TEXT,
  credit_score_at_application INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_loan CHECK (amount > 0),
  CONSTRAINT valid_duration CHECK (duration_months BETWEEN 1 AND 36)
);

-- ============================================================
-- LOAN REPAYMENTS
-- ============================================================
CREATE TABLE public.loan_repayments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id       UUID NOT NULL REFERENCES public.loans(id),
  farmer_id     UUID NOT NULL REFERENCES public.profiles(id),
  amount        NUMERIC(15,2) NOT NULL,
  reference_id  TEXT UNIQUE,
  note          TEXT,
  repaid_at     TIMESTAMPTZ DEFAULT NOW(),
  processed_by  UUID REFERENCES public.profiles(id),
  CONSTRAINT positive_repayment CHECK (amount > 0)
);

-- ============================================================
-- CREDIT SCORES (audit trail)
-- ============================================================
CREATE TABLE public.credit_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID NOT NULL REFERENCES public.profiles(id),
  score           INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  grade           TEXT NOT NULL CHECK (grade IN ('A','B','C','D','F')),
  max_loan_ugx    NUMERIC(15,2) NOT NULL,
  factors         JSONB,  -- breakdown of score components
  calculated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MARKET PRICES (updated by admin/system)
-- ============================================================
CREATE TABLE public.market_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop            TEXT NOT NULL,
  crop_runyoro    TEXT,
  crop_luganda    TEXT,
  price_per_kg    NUMERIC(10,2) NOT NULL,
  market_name     TEXT NOT NULL DEFAULT 'Kyenjojo Town',
  price_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  source          TEXT,
  updated_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OFFLINE SYNC LOG (tracks what synced from IndexedDB)
-- ============================================================
CREATE TABLE public.offline_sync_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID NOT NULL REFERENCES public.profiles(id),
  reference_id    TEXT NOT NULL UNIQUE,
  entity_type     TEXT NOT NULL,  -- 'savings_transaction', 'loan_application'
  payload         JSONB NOT NULL,
  synced_at       TIMESTAMPTZ DEFAULT NOW(),
  device_info     TEXT
);

-- ============================================================
-- TRIGGER: Auto-create profile + wallet + farm_record on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'SACCO Member'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'farmer'),
    COALESCE((NEW.raw_user_meta_data->>'preferred_language')::language_pref, 'runyoro')
  );

  INSERT INTO public.wallets (user_id, balance, savings_balance, shares_owned)
  VALUES (NEW.id, 0.00, 0.00, 0);

  INSERT INTO public.farm_records (farmer_id, has_consented_to_gps)
  VALUES (NEW.id, FALSE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_farm_records_updated_at BEFORE UPDATE ON public.farm_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TRIGGER: Wallet balance auto-update on savings transaction
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_savings_transaction()
RETURNS TRIGGER AS $$
DECLARE
  current_balance NUMERIC(15,2);
BEGIN
  SELECT savings_balance INTO current_balance FROM public.wallets WHERE user_id = NEW.farmer_id FOR UPDATE;

  IF NEW.type = 'deposit' THEN
    UPDATE public.wallets
    SET savings_balance = savings_balance + NEW.amount,
        balance = balance + NEW.amount,
        last_txn_at = NOW()
    WHERE user_id = NEW.farmer_id;
    NEW.balance_after = current_balance + NEW.amount;
  ELSIF NEW.type = 'withdrawal' THEN
    IF current_balance < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient balance: have %, need %', current_balance, NEW.amount;
    END IF;
    UPDATE public.wallets
    SET savings_balance = savings_balance - NEW.amount,
        balance = balance - NEW.amount,
        last_txn_at = NOW()
    WHERE user_id = NEW.farmer_id;
    NEW.balance_after = current_balance - NEW.amount;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_apply_savings
  BEFORE INSERT ON public.savings_transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_savings_transaction();

-- ============================================================
-- TRIGGER: Update loan repaid_amount on each repayment
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_loan_repayment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.loans
  SET repaid_amount = repaid_amount + NEW.amount,
      status = CASE
        WHEN repaid_amount + NEW.amount >= amount * (1 + interest_rate/100 * duration_months/12) THEN 'repaid'
        ELSE status
      END,
      updated_at = NOW()
  WHERE id = NEW.loan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_apply_repayment
  AFTER INSERT ON public.loan_repayments
  FOR EACH ROW EXECUTE FUNCTION public.apply_loan_repayment();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_log ENABLE ROW LEVEL SECURITY;

-- Farmers see only their own data
CREATE POLICY "farmer_own_profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "farmer_own_wallet" ON public.wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "farmer_own_farm" ON public.farm_records FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "farmer_own_transactions" ON public.savings_transactions FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "farmer_own_loans" ON public.loans FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "farmer_own_repayments" ON public.loan_repayments FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "farmer_own_credit" ON public.credit_scores FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "farmer_own_sync" ON public.offline_sync_log FOR ALL USING (auth.uid() = farmer_id);

-- Market prices are readable by all authenticated users
CREATE POLICY "market_prices_public" ON public.market_prices FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can see everything (service_role bypasses RLS entirely)
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_savings_farmer ON public.savings_transactions(farmer_id, created_at DESC);
CREATE INDEX idx_loans_farmer ON public.loans(farmer_id, status);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_repayments_loan ON public.loan_repayments(loan_id);
CREATE INDEX idx_credit_farmer ON public.credit_scores(farmer_id, calculated_at DESC);
CREATE INDEX idx_market_date ON public.market_prices(price_date DESC);
CREATE INDEX idx_offline_ref ON public.offline_sync_log(reference_id);

-- ============================================================
-- SEED: Initial market prices for Kyenjojo
-- ============================================================
INSERT INTO public.market_prices (crop, crop_runyoro, crop_luganda, price_per_kg, market_name, source) VALUES
  ('Maize', 'Kasooli', 'Kasooli', 850, 'Kyenjojo Town', 'SACCO field report'),
  ('Beans', 'Ibishyimbo', 'Bbiinji', 2800, 'Kyenjojo Town', 'SACCO field report'),
  ('Groundnuts', 'Ekinyeebwa', 'Ebinyeebwa', 4200, 'Kyenjojo Town', 'SACCO field report'),
  ('Cassava', 'Omwogo', 'Muwogo', 450, 'Kyenjojo Town', 'SACCO field report'),
  ('Sorghum', 'Orubingo', 'Obuggala', 1100, 'Kyenjojo Town', 'SACCO field report'),
  ('Sweet Potato', 'Kamote', 'Lumonde', 600, 'Kyenjojo Town', 'SACCO field report'),
  ('Tomatoes', 'Nyanya', 'Nyanya', 1800, 'Fort Portal', 'SACCO field report'),
  ('Coffee (Robusta)', 'Kahawa', 'Kawuuwo', 5500, 'Fort Portal', 'SACCO field report'),
  ('Banana (Matooke)', 'Ebitoke', 'Matoke', 700, 'Kyenjojo Town', 'SACCO field report'),
  ('Sunflower', 'Alizeti', 'Alizeti', 1600, 'Kamwenge', 'SACCO field report');

-- ============================================================
-- DONE ✅
-- Next steps:
-- 1. Create a Supabase project at https://supabase.com
-- 2. Copy your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 3. Add them to Vercel: https://vercel.com/dashboard -> sacco-wallet -> Settings -> Env Vars
-- 4. Redeploy the project
-- ============================================================
