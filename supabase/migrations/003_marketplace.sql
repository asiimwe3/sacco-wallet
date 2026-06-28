-- Marketplace listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_name         TEXT NOT NULL,
  seller_village      TEXT,
  seller_type         TEXT NOT NULL DEFAULT 'farmer',
  title               TEXT NOT NULL,
  description         TEXT,
  price               NUMERIC(12,2) NOT NULL,
  unit                TEXT NOT NULL DEFAULT 'kg',
  quantity_available  INTEGER DEFAULT 0,
  category            TEXT NOT NULL DEFAULT 'crops',
  phone               TEXT,
  whatsapp            TEXT,
  posted_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  is_negotiable       BOOLEAN DEFAULT FALSE,
  delivery_available  BOOLEAN DEFAULT FALSE,
  rating              NUMERIC(3,1),
  reviews             INTEGER DEFAULT 0,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Authenticated users can insert" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Sellers can update own" ON public.marketplace_listings FOR UPDATE USING (seller_id = auth.uid());

-- Market prices RLS
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view market prices" ON public.market_prices FOR SELECT USING (TRUE);

-- Savings transactions RLS
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers see own transactions" ON public.savings_transactions FOR SELECT USING (farmer_id = auth.uid());
CREATE POLICY "Farmers insert own transactions" ON public.savings_transactions FOR INSERT WITH CHECK (farmer_id = auth.uid());

-- Wallets RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers see own wallet" ON public.wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Farmers update own wallet" ON public.wallets FOR UPDATE USING (user_id = auth.uid());

-- Loans RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers see own loans" ON public.loans FOR SELECT USING (farmer_id = auth.uid());
CREATE POLICY "Farmers apply for loans" ON public.loans FOR INSERT WITH CHECK (farmer_id = auth.uid());
CREATE POLICY "Admins manage all loans" ON public.loans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','field_officer'))
);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins see all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','field_officer'))
);

-- Credit scores RLS
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers see own scores" ON public.credit_scores FOR SELECT USING (farmer_id = auth.uid());
CREATE POLICY "Admins see all scores" ON public.credit_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','field_officer'))
);
