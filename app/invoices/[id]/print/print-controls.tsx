'use client'

/**
 * Floating print toolbar for the invoice print view.
 *
 * Renders a small bar above the invoice with a back link and a
 * "Download PDF" button. The button calls window.print() which
 * opens the browser's native print dialog — the user selects
 * "Save as PDF" as the destination and gets a clean PDF.
 *
 * The `.print-hide` class in the parent page's <style> block
 * strips this entire toolbar from the printed output so the PDF
 * only contains the invoice itself.
 */

import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'

export function PrintControls() {
  const router = useRouter()

  return (
    <div className="print-hide sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="mx-auto flex max-w-[8.5in] items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          <Printer className="h-4 w-4" />
          Download PDF
        </button>
      </div>
    </div>
  )
}
