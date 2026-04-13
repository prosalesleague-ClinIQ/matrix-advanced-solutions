-- Migration 022: Clean up duplicate indexes + merge permissive policies
--
-- Follow-up to 021. Resolves remaining performance advisor warnings:
--   • 8 duplicate indexes (my new ones duplicated pre-existing ones)
--   • 17 multiple-permissive-policy warnings (merged admin + own into single OR policy)
--   • 2 missing FK indexes

-- ════════════════════════════════════════════════════════════════
-- PART 1: Drop my new indexes that duplicate pre-existing ones
-- ════════════════════════════════════════════════════════════════
-- The pre-existing short-name versions (idx_invoices_clinic, etc.)
-- are kept because older migrations reference them.

DROP INDEX IF EXISTS public.idx_invoices_clinic_id;
DROP INDEX IF EXISTS public.idx_invoices_order_id;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_orders_clinic_id;
DROP INDEX IF EXISTS public.idx_payments_clinic_id;
DROP INDEX IF EXISTS public.idx_payments_order_id;
DROP INDEX IF EXISTS public.idx_users_clinic_id;
DROP INDEX IF EXISTS public.idx_batch_po_items_batch_po_id;

-- ════════════════════════════════════════════════════════════════
-- PART 2: Add the 2 remaining missing FK indexes
-- ════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_clinics_onboarding_reviewed_by
  ON public.clinics(onboarding_reviewed_by);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id
  ON public.payments(invoice_id);

-- ════════════════════════════════════════════════════════════════
-- PART 3: Merge "admin_all" + "own_*" policies into single OR policies
-- ════════════════════════════════════════════════════════════════
-- Postgres evaluates all PERMISSIVE policies for every query and ORs
-- them together. Having two separate policies per action means the
-- planner evaluates both. Merging into one policy with the OR baked
-- in is strictly faster.

-- ─── users ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_all" ON public.users;

CREATE POLICY "users_select" ON public.users
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "users_update" ON public.users
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "users_admin_insert" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "users_admin_delete" ON public.users
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── clinics ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "clinics_own_select" ON public.clinics;
DROP POLICY IF EXISTS "clinics_own_update" ON public.clinics;
DROP POLICY IF EXISTS "clinics_admin_all" ON public.clinics;

CREATE POLICY "clinics_select" ON public.clinics
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "clinics_update" ON public.clinics
  FOR UPDATE TO authenticated
  USING (
    id IN (SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "clinics_admin_insert" ON public.clinics
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "clinics_admin_delete" ON public.clinics
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── orders ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders_own_select" ON public.orders;
DROP POLICY IF EXISTS "orders_own_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;

CREATE POLICY "orders_select" ON public.orders
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "orders_admin_delete" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── order_items ───────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items_own_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_all" ON public.order_items;

CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE clinic_id IN (
        SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid())
      )
    )
    OR public.is_admin()
  );

CREATE POLICY "order_items_admin_insert" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "order_items_admin_update" ON public.order_items
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "order_items_admin_delete" ON public.order_items
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── invoices ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "invoices_own_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_admin_all" ON public.invoices;

CREATE POLICY "invoices_select" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "invoices_admin_insert" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "invoices_admin_update" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "invoices_admin_delete" ON public.invoices
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── payments ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "payments_own_select" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;

CREATE POLICY "payments_select" ON public.payments
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = (SELECT auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "payments_admin_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "payments_admin_update" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "payments_admin_delete" ON public.payments
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── products ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_active_select" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;

CREATE POLICY "products_select" ON public.products
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── product_categories ────────────────────────────────────────
DROP POLICY IF EXISTS "product_categories_active_select" ON public.product_categories;
DROP POLICY IF EXISTS "product_categories_admin_all" ON public.product_categories;

CREATE POLICY "product_categories_select" ON public.product_categories
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "product_categories_admin_insert" ON public.product_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "product_categories_admin_update" ON public.product_categories
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "product_categories_admin_delete" ON public.product_categories
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── sales_reps ────────────────────────────────────────────────
DROP POLICY IF EXISTS "sales_reps_active_select" ON public.sales_reps;
DROP POLICY IF EXISTS "sales_reps_admin_all" ON public.sales_reps;

CREATE POLICY "sales_reps_select" ON public.sales_reps
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "sales_reps_admin_insert" ON public.sales_reps
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "sales_reps_admin_update" ON public.sales_reps
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "sales_reps_admin_delete" ON public.sales_reps
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── challenges ────────────────────────────────────────────────
DROP POLICY IF EXISTS "challenges_public_select" ON public.challenges;
DROP POLICY IF EXISTS "challenges_admin_all" ON public.challenges;

CREATE POLICY "challenges_select" ON public.challenges
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "challenges_admin_insert" ON public.challenges
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "challenges_admin_update" ON public.challenges
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "challenges_admin_delete" ON public.challenges
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── challenge_participants ────────────────────────────────────
DROP POLICY IF EXISTS "participants_own_select" ON public.challenge_participants;
DROP POLICY IF EXISTS "participants_own_insert" ON public.challenge_participants;
DROP POLICY IF EXISTS "participants_own_update" ON public.challenge_participants;
DROP POLICY IF EXISTS "participants_admin_all" ON public.challenge_participants;

CREATE POLICY "participants_select" ON public.challenge_participants
  FOR SELECT TO authenticated
  USING (auth_user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "participants_insert" ON public.challenge_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "participants_update" ON public.challenge_participants
  FOR UPDATE TO authenticated
  USING (auth_user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "participants_admin_delete" ON public.challenge_participants
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── challenge_entries ─────────────────────────────────────────
DROP POLICY IF EXISTS "entries_own_select" ON public.challenge_entries;
DROP POLICY IF EXISTS "entries_own_insert" ON public.challenge_entries;
DROP POLICY IF EXISTS "entries_own_update" ON public.challenge_entries;
DROP POLICY IF EXISTS "entries_admin_all" ON public.challenge_entries;

CREATE POLICY "entries_select" ON public.challenge_entries
  FOR SELECT TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM public.challenge_participants
      WHERE auth_user_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "entries_insert" ON public.challenge_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM public.challenge_participants
      WHERE auth_user_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "entries_update" ON public.challenge_entries
  FOR UPDATE TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM public.challenge_participants
      WHERE auth_user_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "entries_admin_delete" ON public.challenge_entries
  FOR DELETE TO authenticated
  USING (public.is_admin());
