/**
 * Matrix Advanced Solutions — Invoice Types
 */

export interface InvoiceDisplay {
  id: string
  invoiceNumber: string
  invoiceType: 'consulting' | 'product'
  status: string
  subtotal: number
  tax: number
  total: number
  dueDate: string | null
  paidAt: string | null
  locked: boolean
  createdAt: string
  lineItems: InvoiceLineItemDisplay[]
  order?: {
    id: string
    orderNumber: string
  }
  clinic?: {
    id: string
    name: string
  }
}

export interface InvoiceLineItemDisplay {
  sku: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface GenerateInvoiceRequest {
  orderId: string
}

export interface GenerateInvoiceResponse {
  consultingInvoice: {
    id: string
    invoiceNumber: string
    total: number
  }
  productInvoice: {
    id: string
    invoiceNumber: string
    total: number
  }
}
