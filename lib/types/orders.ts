/**
 * Matrix Advanced Solutions — Order & Cart Types
 */

import type { ShippingMethod } from '@/lib/constants'

// ─── Cart Types ─────────────────────────────────────────────────

/**
 * A single cart line. `kind` defaults to 'product' for backward compat.
 * Bundle items use the same shape but `kind: 'bundle'` and the `productId`
 * field holds the bundle id (cart state is keyed by it).
 */
export interface CartItem {
  productId: string
  kind?: 'product' | 'bundle'
  sku: string
  name: string
  category: string
  unit: string
  quantity: number
  prices: number[]
  costs: number[]
}

export interface CartState {
  items: Record<string, CartItem>
  shippingMethod: ShippingMethod
  updatedAt: string
}

// ─── Order Submission Types ─────────────────────────────────────

export interface OrderSubmitRequest {
  items: OrderSubmitItem[]
  shippingMethod: ShippingMethod
  shippingAddress: string
  paymentMethod: 'wire' | 'card'
  notes?: string
}

export interface OrderSubmitItem {
  productId: string
  quantity: number
  kind?: 'product' | 'bundle'
}

export interface OrderSubmitResponse {
  orderId: string
  orderNumber: string
  total: number
  paymentMethod: 'wire' | 'card'
  stripeClientSecret?: string
  wireInstructions?: {
    bankName: string
    routingNumber: string
    accountNumber: string
    accountName: string
    reference: string
  }
}

// ─── Order Display Types ────────────────────────────────────────

export interface OrderWithItems {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  mfgStatus: string
  subtotal: number
  shippingCost: number
  total: number
  shippingMethod: string | null
  shippingAddress: string | null
  notes: string | null
  wireReference: string | null
  createdAt: string
  items: OrderItemDisplay[]
  clinic?: {
    id: string
    name: string
    tier: string
  }
}

export interface OrderItemDisplay {
  id: string
  sku: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  tierApplied: string
  lineTotal: number
  lineCost: number
}

// ─── Order Status Steps ─────────────────────────────────────────

export const ORDER_STEPS = [
  'submitted',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
] as const

export type OrderStep = (typeof ORDER_STEPS)[number]
