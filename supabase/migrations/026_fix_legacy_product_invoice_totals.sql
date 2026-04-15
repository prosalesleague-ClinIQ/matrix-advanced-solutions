-- Migration 026: Fix legacy product invoices where total ≠ order total
--
-- Legacy orders imported from the old production app have both a
-- consulting and product invoice, but on the product invoice the
-- `total` column was set to the pre-shipping subtotal (i.e. it
-- equals the sum of line items, not the order total).
--
-- Post-migration-024 the rule is: both invoices on an order have
-- total = order.total. This migration brings legacy product
-- invoices into alignment so every order in the system has
-- consulting.total == product.total == order.total.
--
-- Only touches product invoices where the total currently does NOT
-- match the order total, so this is idempotent and safe to re-run.

BEGIN;

DO $$
DECLARE
  affected RECORD;
BEGIN
  FOR affected IN
    SELECT i.id as invoice_id, i.total as inv_total, o.total as order_total, o.order_number, i.locked
    FROM public.invoices i
    JOIN public.orders o ON o.id = i.order_id
    WHERE i.invoice_type = 'product'
      AND i.total <> o.total
  LOOP
    -- Unlock temporarily if needed (enforce_invoice_immutability trigger)
    IF affected.locked THEN
      UPDATE public.invoices SET locked = false WHERE id = affected.invoice_id;
    END IF;

    UPDATE public.invoices
       SET total = affected.order_total,
           updated_at = NOW()
     WHERE id = affected.invoice_id;

    IF affected.locked THEN
      UPDATE public.invoices SET locked = true WHERE id = affected.invoice_id;
    END IF;

    RAISE NOTICE 'Fixed product invoice for % (% → %)',
      affected.order_number, affected.inv_total, affected.order_total;
  END LOOP;
END $$;

COMMIT;
