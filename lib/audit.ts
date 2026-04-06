/**
 * Matrix Advanced Solutions — Audit Log Helper
 *
 * Provides a typed helper for writing immutable audit log entries.
 * Uses the admin (service_role) client to bypass RLS.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/types/database";

export interface AuditEntry {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  beforeState?: Json;
  afterState?: Json;
  reason?: string;
  metadata?: Json;
  ipAddress?: string;
}

/**
 * Write an audit log entry. This is append-only — entries cannot
 * be modified or deleted (enforced by DB triggers).
 *
 * @param supabase - Admin Supabase client (service_role)
 * @param entry    - The audit log entry to write
 */
export async function writeAuditLog(
  supabase: SupabaseClient<Database>,
  entry: AuditEntry
): Promise<void> {
  const { error } = await supabase.from("audit_log").insert({
    user_id: entry.userId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    before_state: entry.beforeState ?? {},
    after_state: entry.afterState ?? {},
    reason: entry.reason ?? null,
    metadata: entry.metadata ?? {},
    ip_address: entry.ipAddress ?? null,
  });

  if (error) {
    console.error("[AUDIT] Failed to write audit log:", error.message, {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
    });
  }
}

export const AUDIT_ACTIONS = {
  // Orders
  ORDER_CREATED: "order.created",
  ORDER_SUBMITTED: "order.submitted",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_STATUS_CHANGED: "order.status_changed",

  // Payments
  PAYMENT_RECEIVED: "payment.received",
  PAYMENT_FAILED: "payment.failed",
  WIRE_CONFIRMED: "payment.wire_confirmed",

  // Invoices
  INVOICE_GENERATED: "invoice.generated",
  INVOICE_PAID: "invoice.paid",
  INVOICE_LOCKED: "invoice.locked",

  // Batch PO
  BATCH_GENERATED: "batch.generated",
  BATCH_SUBMITTED: "batch.submitted",
  BATCH_STATUS_UPDATED: "batch.status_updated",
  BATCH_SUBMITTED_TO_SUPPLIER: "batch.submitted_to_supplier",
  BATCH_TRACKING_UPDATED: "batch.tracking_updated",

  // Clinics
  CLINIC_CREATED: "clinic.created",
  CLINIC_TIER_UPGRADED: "clinic.tier_upgraded",
  CLINIC_ACH_VERIFIED: "clinic.ach_verified",

  // Onboarding
  ONBOARDING_DRAFT_SAVED: "clinic.onboarding_draft_saved",
  ONBOARDING_SUBMITTED: "clinic.onboarding_submitted",
  ONBOARDING_APPROVED: "clinic.onboarding_approved",
  ONBOARDING_REJECTED: "clinic.onboarding_rejected",

  // Products
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",

  // Suppliers
  SUPPLIER_CREATED: "supplier.created",
  SUPPLIER_UPDATED: "supplier.updated",
  SUPPLIER_DELETED: "supplier.deleted",

  // Sales Reps
  SALES_REP_CREATED: "sales_rep.created",
  SALES_REP_UPDATED: "sales_rep.updated",
  SALES_REP_DELETED: "sales_rep.deleted",

  // Auth
  USER_LOGIN: "user.login",
  USER_SIGNUP: "user.signup",
} as const;
