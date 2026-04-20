'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useCartContext } from '@/providers/cart-provider'

const navItems: {
  label: string
  href: string
  icon: typeof LayoutDashboard
  external?: boolean
}[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Catalog', href: '/catalog', icon: Package },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Orders', href: '/orders', icon: ClipboardList },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Resource Center', href: 'https://matrix-clinic-resource-center.vercel.app/', icon: BookOpen, external: true },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCartContext()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            !item.external &&
            (pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href)))
          const Icon = item.icon
          const classes = cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'text-steel-400 hover:text-white hover:bg-white/5'
          )

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className={classes}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </a>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={classes}
            >
              <Icon className="w-5 h-5" />
              {item.label}
              {item.href === '/cart' && itemCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-accent-purple text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-steel-400 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  )
}

export function ClinicSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-navy-950/90 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-steel-400 hover:text-white hover:bg-white/5"
          aria-label="Toggle navigation"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Image
          src="/images/matrix-logo-horizontal-sm.webp"
          alt="Matrix"
          width={140}
          height={32}
          className="h-7 w-auto"
        />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-surface-card border-r border-white/10">
            <div className="p-6 border-b border-white/10">
              <Image
                src="/images/matrix-logo-horizontal-sm.webp"
                alt="Matrix"
                width={160}
                height={36}
                className="h-8 w-auto"
              />
              <p className="text-xs text-steel-500 mt-1">Provider Portal</p>
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-surface-card border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <Image
            src="/images/matrix-logo-horizontal-sm.webp"
            alt="Matrix"
            width={160}
            height={36}
            className="h-8 w-auto"
          />
          <p className="text-xs text-steel-500 mt-1">Provider Portal</p>
        </div>
        <SidebarNav />
      </aside>
    </>
  )
}
