/**
 * Matrix Advanced Solutions — Application Constants
 */

// ─── Shipping Rates ─────────────────────────────────────────────
export const SHIPPING_METHODS = {
  standard: {
    label: 'Standard Shipping',
    description: '5-7 business days',
    price: 15.0,
  },
  express: {
    label: 'Express Shipping',
    description: '2-3 business days',
    price: 35.0,
  },
  overnight: {
    label: 'Overnight Shipping',
    description: 'Next business day',
    price: 75.0,
  },
} as const

export type ShippingMethod = keyof typeof SHIPPING_METHODS

// ─── Wire Transfer Instructions ─────────────────────────────────
export const WIRE_INSTRUCTIONS = {
  bankName: 'Bank of America',
  routingNumber: '026009593',
  accountNumber: '898164338257',
  accountName: 'Matrix Advanced Solutions',
  reference: 'Include your Order Number as reference',
} as const

export const ACH_INSTRUCTIONS = {
  bankName: 'Bank of America',
  routingNumber: '063100277',
  accountNumber: '898164338257',
  accountName: 'Matrix Advanced Solutions',
  reference: 'Include your Order Number as reference',
} as const

// ─── Document Number Formats ────────────────────────────────────
export const DOC_FORMATS = {
  order: 'ORD-YYYY-#####',
  invoice: 'INV-YYYY-#####',
  productInvoice: 'PI-YYYY-#####',
  batch: 'BATCH-YYYY-MMDD-###',
} as const

// ─── Product Categories ─────────────────────────────────────────
export const PRODUCT_CATEGORIES = ['All', 'GLP-1', 'Peptides'] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// ─── Product Units ──────────────────────────────────────────────
export const PRODUCT_UNITS = [
  'vial',
  'kit',
  'syringe',
  'bottle',
  'capsule',
  'tablet',
  'box',
  'pack',
] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]

// ─── Order Status Labels ────────────────────────────────────────
export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  awaiting_wire: 'Awaiting Wire',
  paid: 'Paid',
  confirmed: 'Confirmed',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const MFG_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  batched: 'Batched',
  in_production: 'In Production',
  shipped: 'Shipped',
  received: 'Received',
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
  void: 'Void',
}

// ─── Clinic Tiers ───────────────────────────────────────────────
export const CLINIC_TIERS = {
  new: {
    label: 'New',
    description: 'Wire transfer only. Upgrade after first completed order.',
    allowedPaymentMethods: ['wire'] as const,
  },
  returning: {
    label: 'Returning',
    description: 'Card and ACH payments enabled.',
    allowedPaymentMethods: ['wire', 'card', 'ach'] as const,
  },
} as const

export type ClinicTier = keyof typeof CLINIC_TIERS

// ─── Consulting Fee ─────────────────────────────────────────────
export const CONSULTING_FEE_DESCRIPTION =
  'Professional Consulting Services' as const

// ─── Practice Types ─────────────────────────────────────────────
export const PRACTICE_TYPE_OPTIONS = [
  { value: 'medical_clinic', label: 'Medical Clinic' },
  { value: 'wellness_center', label: 'Wellness Center' },
  { value: 'anti_aging_clinic', label: 'Anti-Aging Clinic' },
  { value: 'medspa', label: 'Medspa' },
  { value: 'functional_medicine', label: 'Functional Medicine' },
  { value: 'sports_medicine', label: 'Sports Medicine' },
  { value: 'naturopathic_practice', label: 'Naturopathic Practice' },
  { value: 'other', label: 'Other' },
] as const

// ─── Onboarding Status Labels ──────────────────────────────────
export const ONBOARDING_STATUS_LABELS: Record<string, string> = {
  pending: 'Not Started',
  submitted: 'Under Review',
  approved: 'Approved',
  rejected: 'Needs Changes',
}

// ─── Batch PO Status Labels ────────────────────────────────────
export const BATCH_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  in_production: 'In Production',
  shipped: 'Shipped',
  received: 'Received',
}

// ─── Pagination ─────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
