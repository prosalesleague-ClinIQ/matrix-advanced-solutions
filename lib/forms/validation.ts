import { z } from 'zod'

export const contactSchema = z.object({
  clinicName: z.string().min(2, 'Clinic name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  role: z.string().min(2, 'Your role is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number is required'),
  state: z.string().min(2, 'State is required'),
  specialty: z.string().optional(),
  clinicType: z.string().optional(),
  providerCount: z.string().optional(),
  categoriesOfInterest: z.array(z.string()).optional(),
  urgency: z.string().optional(),
  notes: z.string().optional(),
  referralSource: z.string().optional(),
  inquiryType: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

export const catalogRequestSchema = contactSchema.extend({
  inquiryType: z.string().optional(),
  categoriesOfInterest: z.array(z.string()).min(1, 'Select at least one category'),
})

export type CatalogRequestFormData = z.infer<typeof catalogRequestSchema>

export const onboardingSchema = contactSchema.extend({
  inquiryType: z.string().optional(),
  clinicType: z.string().min(2, 'Clinic type is required'),
  providerCount: z.string().min(1, 'Provider count is required'),
  state: z.string().min(2, 'State is required'),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

export const strategyCallSchema = contactSchema.extend({
  inquiryType: z.string().optional(),
  notes: z.string().min(10, 'Please describe your goals briefly'),
})

export type StrategyCallFormData = z.infer<typeof strategyCallSchema>
