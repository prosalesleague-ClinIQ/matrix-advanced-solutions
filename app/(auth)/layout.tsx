import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Routes under (auth) that should still render even for logged-in users
// (so they can use the password-reset form when redirected from an email).
const LOGGED_IN_ALLOWED = ['/reset-password']

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Belt-and-suspenders redirect: middleware already handles this, but
  // re-checking at the layout level guarantees an authenticated user
  // can't see the login/signup form even if middleware is ever bypassed.
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? ''
    const isAllowedForLoggedIn = LOGGED_IN_ALLOWED.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )

    if (!isAllowedForLoggedIn) {
      // Look up role to pick the right destination.
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const isAdmin =
        profile && ['matrix_admin', 'matrix_staff'].includes(profile.role)

      redirect(isAdmin ? '/admin/dashboard' : '/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image
              src="/images/matrix-logo-horizontal-sm.webp"
              alt="Matrix Advanced Solutions"
              width={200}
              height={45}
              className="h-10 w-auto mx-auto"
              priority
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
