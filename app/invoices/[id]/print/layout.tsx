/**
 * Print-only layout.
 *
 * The root app layout suppresses the marketing header/footer on any
 * route prefixed with /invoices, but this layout strips EVERYTHING
 * else too — no sidebars, no intro overlay, no cart provider —
 * because the page this wraps is meant to be Printed-to-PDF, not
 * browsed as part of the app.
 *
 * We also set background-color: white so the print output has a
 * clean white background no matter what the dark theme is doing.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false },
}

export default function InvoicePrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
