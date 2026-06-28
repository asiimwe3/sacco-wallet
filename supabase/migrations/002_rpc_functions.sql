-- ============================================================
-- SACCO Wallet — RPC Functions (callable from client)
-- ============================================================

-- Get farmer dashboard summary (single query, no N+1)
CREATE OR REPLACE FUNCTION public.get_farmer_dashboard(p_farmer_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = p_farmer_id),
    'wallet',  (SELECT row_to_json(w) FROM public.wallets w WHERE w.user_id = p_farmer_id),
    'farm',    (SELECT row_to_json(f) FROM public.farm_records f WHERE f.farmer_id = p_farmer_id),
    'active_loan', (
      SELECT row_to_json(l) FROM public.loans l
      WHERE l.farmer_id = p_farmer_id AND l.status = 'active'
      ORDER BY l.created_at DESC LIMIT 1
    ),
    'latest_credit_score', (
      SELECT row_to_json(c) FROM public.credit_scores c
      WHERE c.farmer_id = p_farmer_id
      ORDER BY c.calculated_at DESC LIMIT 1
    ),
    'recent_transactions', (
      SELECT json_agg(t) FROM (
        SELECT * FROM public.savings_transactions
        WHERE farmer_id = p_farmer_id
        ORDER BY created_at DESC LIMIT 5
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get admin overview stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_farmers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'farmer'),
      'active_farmers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'farmer' AND is_active = TRUE),
      'total_savings_ugx', (SELECT COALESCE(SUM(savings_balance), 0) FROM public.wallets),
      'total_loans_active', (SELECT COUNT(*) FROM public.loans WHERE status = 'active'),
      'total_loans_ugx', (SELECT COALESCE(SUM(amount), 0) FROM public.loans WHERE status IN ('active','approved')),
      'pending_applications', (SELECT COUNT(*) FROM public.loans WHERE status = 'pending'),
      'repayment_rate', (
        SELECT ROUND(
          100.0 * COUNT(*) FILTER (WHERE status = 'repaid') / NULLIF(COUNT(*) FILTER (WHERE status IN ('repaid','defaulted')), 0),
          1
        ) FROM public.loans
      ),
      'new_members_this_month', (
        SELECT COUNT(*) FROM public.profiles
        WHERE role = 'farmer' AND joined_sacco_at >= DATE_TRUNC('month', NOW())
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync offline transaction (idempotent — safe to retry)
CREATE OR REPLACE FUNCTION public.sync_offline_transaction(
  p_farmer_id   UUID,
  p_type        transaction_type,
  p_amount      NUMERIC,
  p_reference_id TEXT,
  p_note        TEXT DEFAULT NULL,
  p_device_info TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_wallet_id UUID;
  v_txn_id    UUID;
BEGIN
  -- Idempotency check: already synced?
  IF EXISTS (SELECT 1 FROM public.savings_transactions WHERE reference_id = p_reference_id) THEN
    RETURN json_build_object('status', 'already_synced', 'reference_id', p_reference_id);
  END IF;

  SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_farmer_id;

  INSERT INTO public.savings_transactions
    (wallet_id, farmer_id, type, amount, balance_after, reference_id, note, synced_from_offline)
  VALUES
    (v_wallet_id, p_farmer_id, p_type, p_amount, 0, p_reference_id, p_note, TRUE)
  RETURNING id INTO v_txn_id;

  -- Log sync
  INSERT INTO public.offline_sync_log (farmer_id, reference_id, entity_type, payload, device_info)
  VALUES (p_farmer_id, p_reference_id, 'savings_transaction',
    json_build_object('type', p_type, 'amount', p_amount, 'note', p_note)::jsonb, p_device_info)
  ON CONFLICT (reference_id) DO NOTHING;

  RETURN json_build_object('status', 'synced', 'transaction_id', v_txn_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate and store credit score
CREATE OR REPLACE FUNCTION public.recalculate_credit_score(p_farmer_id UUID)
RETURNS JSON AS $$
DECLARE
  v_savings_months INTEGER;
  v_savings_total NUMERIC;
  v_loans_taken INTEGER;
  v_loans_repaid INTEGER;
  v_loans_defaulted INTEGER;
  v_farm_size NUMERIC;
  v_gps_verified BOOLEAN;
  v_member_months INTEGER;
  v_score INTEGER := 0;
  v_grade TEXT;
  v_max_loan NUMERIC;
BEGIN
  -- Gather factors
  SELECT
    EXTRACT(MONTH FROM AGE(NOW(), MIN(created_at))),
    COALESCE(SUM(amount) FILTER (WHERE type='deposit'), 0)
  INTO v_savings_months, v_savings_total
  FROM public.savings_transactions WHERE farmer_id = p_farmer_id;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status='repaid'), COUNT(*) FILTER (WHERE status='defaulted')
  INTO v_loans_taken, v_loans_repaid, v_loans_defaulted
  FROM public.loans WHERE farmer_id = p_farmer_id;

  SELECT farm_size_acres, (gps_lat IS NOT NULL AND has_consented_to_gps)
  INTO v_farm_size, v_gps_verified
  FROM public.farm_records WHERE farmer_id = p_farmer_id;

  SELECT EXTRACT(MONTH FROM AGE(NOW(), joined_sacco_at))
  INTO v_member_months FROM public.profiles WHERE id = p_farmer_id;

  -- Score calculation (same logic as lib/credit-score.ts)
  v_score := v_score + LEAST(30, ROUND((COALESCE(v_savings_months,0)::NUMERIC/12)*20 + CASE WHEN COALESCE(v_savings_total,0) > 100000 THEN 10 ELSE v_savings_total/10000 END));
  v_score := v_score + CASE WHEN v_loans_taken = 0 THEN 15 ELSE LEAST(35, GREATEST(0, ROUND((v_loans_repaid::NUMERIC / v_loans_taken) * 30) - COALESCE(v_loans_defaulted,0) * 8)) END;
  v_score := v_score + LEAST(15, ROUND(COALESCE(v_farm_size,0) * 2)) + CASE WHEN v_gps_verified THEN 5 ELSE 0 END;
  v_score := v_score + LEAST(15, ROUND((COALESCE(v_member_months,0)::NUMERIC / 24) * 15));
  v_score := LEAST(100, v_score);

  v_grade := CASE WHEN v_score >= 80 THEN 'A' WHEN v_score >= 65 THEN 'B' WHEN v_score >= 50 THEN 'C' WHEN v_score >= 35 THEN 'D' ELSE 'F' END;
  v_max_loan := CASE WHEN v_score >= 80 THEN 5000000 WHEN v_score >= 65 THEN 3000000 WHEN v_score >= 50 THEN 1500000 WHEN v_score >= 35 THEN 500000 ELSE 0 END;

  INSERT INTO public.credit_scores (farmer_id, score, grade, max_loan_ugx)
  VALUES (p_farmer_id, v_score, v_grade, v_max_loan);

  RETURN json_build_object('score', v_score, 'grade', v_grade, 'max_loan_ugx', v_max_loan);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
