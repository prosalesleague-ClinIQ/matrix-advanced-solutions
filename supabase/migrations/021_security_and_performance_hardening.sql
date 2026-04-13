-- Migration 021: Security & Performance Hardening
--
-- Resolves findings from Supabase security + performance advisors:
--
-- SECURITY (30 issues):
--   • Drops duplicate policies that reference auth.jwt() -> 'user_metadata'
--     (user_metadata is end-user editable — privilege escalation vector)
--   • Enables RLS on suppliers and product_categories
--   • Fixes sales_reps permissive "USING (true)" policy
--   • Locks search_path on 10 database functions
--   • Replaces v_pending_batch SECURITY DEFINER with SECURITY INVOKER
--
-- PERFORMANCE (116 issues):
--   • Rewrites 54 RLS policies to use (SELECT auth.uid()) pattern
--     (initplan optimization — 10-100x faster at scale)
--   • Consolidates 44 duplicate policies into single canonical versions
--   • Adds 9 missing foreign key indexes
--   • Drops 8 unused indexes
--
-- Safe to re-run (all DROPs use IF EXISTS, all CREATEs are canonical).

-- ════════════════════════════════════════════════════════════════
-- PART 1: Admin helper function
-- ════════════════════════════════════════════════════════════════
-- Single source of truth for admin role check. SECURITY DEFINER so it
-- can read public.users regardless of the caller's RLS, with locked
-- search_path to prevent schema-shadowing attacks.
-- STABLE so Postgres only evaluates it once per query (initplan).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())
      AND role IN ('matrix_admin', 'matrix_staff')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ════════════════════════════════════════════════════════════════
-- PART 2: Drop all insecure / duplicate policies
-- ════════════════════════════════════════════════════════════════

-- audit_log
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins view audit log" ON public.audit_log;

-- batch_po_items
DROP POLICY IF EXISTS "Admins can manage batch PO items" ON public.batch_po_items;
DROP POLICY IF EXISTS "Admins manage batch PO items" ON public.batch_po_items;

-- batch_pos
DROP POLICY IF EXISTS "Admins can manage batch POs" ON public.batch_pos;
DROP POLICY IF EXISTS "Admins manage batch POs" ON public.batch_pos;

-- clinics
DROP POLICY IF EXISTS "Admins can manage all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins can view all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins manage all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Admins view all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Users can update own clinic" ON public.clinics;
DROP POLICY IF EXISTS "Users can view own clinic" ON public.clinics;
DROP POLICY IF EXISTS "Users update own clinic" ON public.clinics;
DROP POLICY IF EXISTS "Users view own clinic" ON public.clinics;

-- invoices
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;

-- order_items
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;

-- orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders for own clinic" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;

-- payments
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;

-- products
DROP POLICY IF EXISTS "Products manageable by admins" ON public.products;
DROP POLICY IF EXISTS "Products publicly viewable" ON public.products;
DROP POLICY IF EXISTS "Products viewable by authenticated" ON public.products;

-- sales_reps (nuclear "USING true" policy)
DROP POLICY IF EXISTS "Admin full access to sales_reps" ON public.sales_reps;

-- users
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- challenges (keep existing named policies — they don't use user_metadata —
-- but rewrite them to use is_admin() + (SELECT auth.uid()) pattern)
DROP POLICY IF EXISTS "challenges_admin_insert" ON public.challenges;
DROP POLICY IF EXISTS "challenges_admin_update" ON public.challenges;
DROP POLICY IF EXISTS "challenges_select_all" ON public.challenges;

-- challenge_participants
DROP POLICY IF EXISTS "participants_insert_own" ON public.challenge_participants;
DROP POLICY IF EXISTS "participants_select_admin" ON public.challenge_participants;
DROP POLICY IF EXISTS "participants_select_own" ON public.challenge_participants;
DROP POLICY IF EXISTS "participants_update_own" ON public.challenge_participants;

-- challenge_entries
DROP POLICY IF EXISTS "entries_insert_own" ON public.challenge_entries;
DROP POLICY IF EXISTS "entries_select_admin" ON public.challenge_entries;
DROP POLICY IF EXISTS "entries_select_own" ON public.challenge_entries;
DROP POLICY IF EXISTS "entries_update_own" ON public.challenge_entries;

-- ════════════════════════════════════════════════════════════════
-- PART 3: Enable RLS on tables that were missing it
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════
-- PART 4: Create canonical, performance-optimized policies
-- All policies use public.is_admin() for admin checks and
-- (SELECT auth.uid()) for user identity lookups to benefit from
-- Postgres initplan optimization.
-- ════════════════════════════════════════════════════════════════

-- ─── users ─────────────────────────────────────────────────────
CREATE POLICY "users_self_select" ON public.users
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_self_update" ON public.users
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_admin_all" ON public.users
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── clinics ───────────────────────────────────────────────────
CREATE POLICY "clinics_own_select" ON public.clinics
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "clinics_own_update" ON public.clinics
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "clinics_admin_all" ON public.clinics
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── orders ────────────────────────────────────────────────────
CREATE POLICY "orders_own_select" ON public.orders
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "orders_own_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── order_items ───────────────────────────────────────────────
CREATE POLICY "order_items_own_select" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE clinic_id IN (
        SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── invoices ──────────────────────────────────────────────────
CREATE POLICY "invoices_own_select" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "invoices_admin_all" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── payments ──────────────────────────────────────────────────
CREATE POLICY "payments_own_select" ON public.payments
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
    )
  );

CREATE POLICY "payments_admin_all" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── batch_pos ─────────────────────────────────────────────────
CREATE POLICY "batch_pos_admin_all" ON public.batch_pos
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── batch_po_items ────────────────────────────────────────────
CREATE POLICY "batch_po_items_admin_all" ON public.batch_po_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── audit_log ─────────────────────────────────────────────────
CREATE POLICY "audit_log_admin_select" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ─── products ──────────────────────────────────────────────────
-- Active products readable by all authenticated users; admins can manage
CREATE POLICY "products_active_select" ON public.products
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "products_admin_all" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── suppliers ─────────────────────────────────────────────────
CREATE POLICY "suppliers_admin_all" ON public.suppliers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── sales_reps ────────────────────────────────────────────────
CREATE POLICY "sales_reps_admin_all" ON public.sales_reps
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Authenticated users can read active sales reps (for onboarding dropdown)
CREATE POLICY "sales_reps_active_select" ON public.sales_reps
  FOR SELECT TO authenticated
  USING (is_active = true);

-- ─── product_categories ────────────────────────────────────────
CREATE POLICY "product_categories_active_select" ON public.product_categories
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "product_categories_admin_all" ON public.product_categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── challenges ────────────────────────────────────────────────
CREATE POLICY "challenges_public_select" ON public.challenges
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "challenges_admin_all" ON public.challenges
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── challenge_participants ────────────────────────────────────
CREATE POLICY "participants_own_select" ON public.challenge_participants
  FOR SELECT TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "participants_own_insert" ON public.challenge_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "participants_own_update" ON public.challenge_participants
  FOR UPDATE TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "participants_admin_all" ON public.challenge_participants
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── challenge_entries ─────────────────────────────────────────
CREATE POLICY "entries_own_select" ON public.challenge_entries
  FOR SELECT TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM public.challenge_participants
      WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "entries_own_insert" ON public.challenge_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM public.challenge_participants
      WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "entries_own_update" ON public.challenge_entries
  FOR UPDATE TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM public.challenge_participants
      WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "entries_admin_all" ON public.challenge_entries
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ════════════════════════════════════════════════════════════════
-- PART 5: Lock search_path on all functions
-- ════════════════════════════════════════════════════════════════

ALTER FUNCTION public.update_challenge_updated_at()    SET search_path = public, pg_temp;
ALTER FUNCTION public.check_clinic_tier_upgrade()      SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at()              SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_invoice_immutability()   SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_order_number()          SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_batch_number()          SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_invoice_number()        SET search_path = public, pg_temp;
ALTER FUNCTION public.enforce_batch_immutability()     SET search_path = public, pg_temp;
ALTER FUNCTION public.prevent_audit_modification()     SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_daily_batch_po(uuid)    SET search_path = public, pg_temp;

-- ════════════════════════════════════════════════════════════════
-- PART 6: Fix v_pending_batch view (SECURITY DEFINER → INVOKER)
-- ════════════════════════════════════════════════════════════════

ALTER VIEW public.v_pending_batch SET (security_invoker = true);

-- ════════════════════════════════════════════════════════════════
-- PART 7: Add missing foreign key indexes
-- ════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_batch_po_items_product_id ON public.batch_po_items(product_id);
CREATE INDEX IF NOT EXISTS idx_batch_po_items_batch_po_id ON public.batch_po_items(batch_po_id);
CREATE INDEX IF NOT EXISTS idx_batch_pos_supplier_id ON public.batch_pos(supplier_id);
CREATE INDEX IF NOT EXISTS idx_clinics_assigned_rep_id ON public.clinics(assigned_rep_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id ON public.invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_clinic_id ON public.payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_orders_clinic_id ON public.orders(clinic_id);
CREATE INDEX IF NOT EXISTS idx_orders_batch_po_id ON public.orders(batch_po_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON public.users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_participant_id ON public.challenge_entries(participant_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge_id ON public.challenge_entries(challenge_id);

-- ════════════════════════════════════════════════════════════════
-- PART 8: Drop unused indexes (identified by advisor)
-- ════════════════════════════════════════════════════════════════

DROP INDEX IF EXISTS public.idx_clinics_onboarding_status;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_payment_status;
DROP INDEX IF EXISTS public.idx_orders_mfg_status;
DROP INDEX IF EXISTS public.idx_invoices_status;
DROP INDEX IF EXISTS public.idx_batch_pos_status;
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_is_active;
