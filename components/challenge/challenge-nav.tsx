'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ChallengeNavProps {
  isAuthenticated: boolean
  participantName?: string
}

const NAV_LINKS = [
  { href: '/challenge/dashboard', label: 'Dashboard' },
  { href: '/challenge/check-in', label: 'Check-In' },
  { href: '/challenge/progress', label: 'Progress' },
  { href: '/challenge/profile', label: 'Profile' },
]

export function ChallengeNav({ isAuthenticated, participantName }: ChallengeNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/challenge')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/85 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand */}
          <Link href="/challenge" className="flex items-center gap-2">
            <span className="text-lg font-bold gradient-text-accent">MuscleLock</span>
            <span className="text-sm text-steel-500 hidden sm:inline">Transformation Study</span>
          </Link>

          {/* Right: Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-accent-cyan bg-accent-cyan/10'
                        : 'text-steel-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {participantName && (
                  <span className="ml-3 text-sm text-steel-300">{participantName}</span>
                )}
                <button
                  onClick={handleSignOut}
                  className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-steel-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/challenge/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-steel-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link href="/challenge/signup">
                  <Button size="sm">Join the Study</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-steel-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-950/95 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-accent-cyan bg-accent-cyan/10'
                        : 'text-steel-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {participantName && (
                  <div className="px-3 py-2 text-sm text-steel-300">{participantName}</div>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center gap-1.5 w-full px-3 py-2.5 rounded-lg text-sm text-steel-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/challenge/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-steel-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/challenge/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5"
                >
                  <Button size="sm" className="w-full">Join the Study</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
