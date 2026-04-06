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

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) {
    redirect('/login')
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-navy-950">
        <ClinicSidebar />
        <main className="flex-1 p-6 pt-20 md:pt-6">{children}</main>
      </div>
    </CartProvider>
  )
}
