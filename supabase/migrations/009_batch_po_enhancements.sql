-- Migration 009: Batch PO Enhancements for Supplier Order Management
--
-- Adds tracking columns to batch_pos and orders tables to support:
-- 1. Supplier notes and submission tracking on batch POs
-- 2. Per-order tracking numbers and shipping timestamps

-- ─── batch_pos additions ───────────────────────────────────────
ALTER TABLE public.batch_pos
  ADD COLUMN IF NOT EXISTS supplier_notes TEXT,
  ADD COLUMN IF NOT EXISTS submitted_to_supplier_at TIMESTAMPTZ;

-- ─── orders additions ──────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
