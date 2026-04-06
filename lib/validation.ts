/**
 * Matrix Advanced Solutions — Zod Validation Schemas
 *
 * Shared validation schemas for API routes and forms.
 */

import { z } from 'zod'

// ─── Auth Schemas ───────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  clinicName: z
    .string()
    .min(2, 'Clinic name must be at least 2 characters')
    .max(200, 'Clinic name must be less than 200 characters'),
})

export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─── Order Schemas ──────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity cannot exceed 10,000'),
})

export const orderSubmitSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item')
    .max(50, 'Order cannot contain more than 50 items'),
  shippingMethod: z.enum(['standard', 'express', 'overnight'], {
    message: 'Please select a shipping method',
  }),
  shippingAddress: z
    .string()
    .min(10, 'Please enter a complete shipping address')
    .max(500, 'Shipping address is too long'),
  paymentMethod: z.enum(['wire', 'card'], {
    message: 'Please select a payment method',
  }),
  notes: z.string().max(1000, 'Notes cannot exceed 1,000 characters').optional(),
})

export type OrderSubmitInput = z.infer<typeof orderSubmitSchema>

// ─── Clinic Profile Schemas ─────────────────────────────────────

export const billingProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(200),
  businessAddress: z.string().min(10, 'Please enter a complete address').max(500),
  taxId: z.string().max(50).optional(),
  primaryPhone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
})

export type BillingProfileInput = z.infer<typeof billingProfileSchema>

// ─── Admin Schemas ──────────────────────────────────────────────

export const wireConfirmSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  wireReference: z
    .string()
    .min(3, 'Wire reference must be at least 3 characters')
    .max(100, 'Wire reference is too long'),
})

export type WireConfirmInput = z.infer<typeof wireConfirmSchema>

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(200),
  sku: z.string().min(1, 'SKU is required').max(50),
  category: z.string().min(1, 'Category is required').max(100),
  unit: z.string().min(1, 'Unit is required').max(50),
  description: z.string().max(500).optional().or(z.literal('')),
  prices: z
    .array(z.number().min(0, 'Price cannot be negative'))
    .length(4, 'Prices must have exactly 4 tier values'),
  costs: z
    .array(z.number().min(0, 'Cost cannot be negative'))
    .length(4, 'Costs must have exactly 4 tier values'),
  supplierId: z.string().uuid('Invalid supplier ID').optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)),
  isActive: z.boolean().optional(),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>

// ─── Onboarding Schemas ────────────────────────────────────────

export const PRACTICE_TYPES = [
  'medical_clinic',
  'wellness_center',
  'anti_aging_clinic',
  'medspa',
  'functional_medicine',
  'sports_medicine',
  'naturopathic_practice',
  'other',
] as const

export const onboardingStep1Schema = z.object({
  name: z
    .string()
    .min(2, 'Clinic name must be at least 2 characters')
    .max(200),
  primaryContactName: z
    .string()
    .min(2, 'Contact name is required')
    .max(100),
  primaryPhone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, 'Please enter a valid phone number'),
  businessAddress: z
    .string()
    .min(10, 'Please enter a complete business address')
    .max(500),
  taxId: z
    .string()
    .min(1, 'Tax ID is required')
    .regex(/^\d{2}-?\d{7}$/, 'Tax ID must be in format XX-XXXXXXX'),
})

export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>

export const onboardingStep2Schema = z.object({
  shippingAddress: z
    .string()
    .min(10, 'Please enter a complete shipping address')
    .max(500),
  shippingSameAsBusiness: z.boolean(),
})

export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>

export const onboardingStep3Schema = z.object({
  practiceType: z.enum(PRACTICE_TYPES, {
    message: 'Please select a practice type',
  }),
  medicalLicense: z
    .string()
    .max(50)
    .optional()
    .or(z.literal('')),
  npiNumber: z
    .string()
    .regex(/^\d{10}$/, 'NPI must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  assignedRepId: z
    .string()
    .uuid('Invalid sales rep ID')
    .optional()
    .or(z.literal('')),
})

export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>

export const onboardingSubmitSchema = onboardingStep1Schema
  .merge(onboardingStep2Schema.omit({ shippingSameAsBusiness: true }))
  .merge(onboardingStep3Schema)

export type OnboardingSubmitInput = z.infer<typeof onboardingSubmitSchema>

export const onboardingReviewSchema = z
  .object({
    clinicId: z.string().uuid('Invalid clinic ID'),
    action: z.enum(['approve', 'reject']),
    reason: z.string().max(1000).optional(),
    assignedRepId: z.string().uuid('Invalid sales rep ID').optional().or(z.literal('')),
  })
  .refine(
    (data) =>
      data.action !== 'reject' || (data.reason && data.reason.length >= 3),
    { message: 'Rejection reason is required', path: ['reason'] }
  )

export type OnboardingReviewInput = z.infer<typeof onboardingReviewSchema>

// ─── Sales Rep Schemas ────────────────────────────────────────

export const salesRepCreateSchema = z.object({
  name: z.string().min(2, 'Rep name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  ghlUserId: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

export type SalesRepCreateInput = z.infer<typeof salesRepCreateSchema>
