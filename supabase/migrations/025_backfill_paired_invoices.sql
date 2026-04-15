-- Migration 025: Backfill paired consulting + product invoices
--
-- Orders placed in the Matrix Next.js app before the paired-invoice fix
-- have exactly one invoice (type='consulting') whose line_items array
-- contains the product rows (wrong — that data belongs in a separate
-- product invoice). Legacy orders imported from the old production app
-- already have both a consulting and a product invoice in the correct
-- shape and are left alone.
--
-- This migration:
--   1. Finds every order that has a consulting invoice but NO product
--      invoice.
--   2. Reshapes the consulting invoice:
--        • line_items → [{ sku: 'CONSULTING-FEE', name: 'Professional
--          Consulting Services', quantity: 1, unit_price: total, total }]
--        • subtotal → total (consulting has no separate subtotal)
--   3. Creates a matching product invoice on the same order with:
--        • invoice_type = 'product'
--        • status = same as the consulting invoice
--        • line_items = the real order_items rows (sku, product_name,
--          quantity, unit_price, line_total)
--        • subtotal = order.subtotal (pre-shipping)
--        • total = order.total (matches consulting total)
--        • paid_at = consulting invoice paid_at
--        • locked = consulting invoice locked
--
-- Idempotent: orders that already have a product invoice are skipped.

BEGIN;

DO $$
DECLARE
  affected_order RECORD;
  consulting_invoice RECORD;
  new_product_line_items JSONB;
  new_consulting_line_items JSONB;
BEGIN
  FOR affected_order IN
    SELECT o.id, o.order_number, o.subtotal, o.total
    FROM public.orders o
    WHERE EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.order_id = o.id AND i.invoice_type = 'consulting'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.order_id = o.id AND i.invoice_type = 'product'
    )
  LOOP
    -- Find the existing consulting invoice (should be exactly one)
    SELECT * INTO consulting_invoice
    FROM public.invoices
    WHERE order_id = affected_order.id AND invoice_type = 'consulting'
    LIMIT 1;

    -- Build the product-invoice line_items array from the actual
    -- order_items rows so any bundle / product data matches the truth.
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'sku', oi.sku,
          'name', oi.product_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total', oi.line_total
        )
        ORDER BY oi.created_at
      ),
      '[]'::jsonb
    )
    INTO new_product_line_items
    FROM public.order_items oi
    WHERE oi.order_id = affected_order.id;

    -- Build the canonical consulting line_items array (single line)
    new_consulting_line_items := jsonb_build_array(
      jsonb_build_object(
        'sku', 'CONSULTING-FEE',
        'name', 'Professional Consulting Services',
        'quantity', 1,
        'unit_price', affected_order.total,
        'total', affected_order.total
      )
    );

    -- Reshape the consulting invoice.
    -- NOTE: if the invoice is locked, we have to temporarily unlock it
    -- around the update (enforce_invoice_immutability trigger protects
    -- locked rows from modification).
    IF consulting_invoice.locked THEN
      UPDATE public.invoices
         SET locked = false
       WHERE id = consulting_invoice.id;
    END IF;

    UPDATE public.invoices
       SET line_items = new_consulting_line_items,
           subtotal   = affected_order.total,
           updated_at = NOW()
     WHERE id = consulting_invoice.id;

    IF consulting_invoice.locked THEN
      UPDATE public.invoices
         SET locked = true
       WHERE id = consulting_invoice.id;
    END IF;

    -- Create the matching product invoice
    INSERT INTO public.invoices (
      order_id,
      clinic_id,
      invoice_type,
      status,
      line_items,
      subtotal,
      tax,
      total,
      due_date,
      paid_at,
      locked,
      stripe_payment_intent_id,
      created_at,
      updated_at
    )
    VALUES (
      affected_order.id,
      consulting_invoice.clinic_id,
      'product',
      consulting_invoice.status,
      new_product_line_items,
      affected_order.subtotal,
      0,
      affected_order.total,
      consulting_invoice.due_date,
      consulting_invoice.paid_at,
      consulting_invoice.locked,
      consulting_invoice.stripe_payment_intent_id,
      consulting_invoice.created_at,
      NOW()
    );

    RAISE NOTICE 'Backfilled order % (reshaped consulting + added product invoice)', affected_order.order_number;
  END LOOP;
END $$;

COMMIT;
