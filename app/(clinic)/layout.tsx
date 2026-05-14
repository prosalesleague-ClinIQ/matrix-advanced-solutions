import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClinicSidebar } from '@/components/layout/clinic-sidebar'
import { CartProvider } from '@/providers/cart-provider'

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Note: we intentionally do NOT redirect users with no clinic_id back to
  // /login here — middleware would just bounce them back, causing a loop.
  // The dashboard page renders an inline "complete your setup" state for that
  // case. Other clinic-area pages handle missing profile data themselves.

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-navy-950">
        <ClinicSidebar />
        <main className="flex-1 p-6 pt-20 md:pt-6">{children}</main>
      </div>
    </CartProvider>
  )
}
