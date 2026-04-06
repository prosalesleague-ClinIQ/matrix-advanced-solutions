'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  UserCheck,
  Users,
  Layers,
  Truck,
  Package,
  ScrollText,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'Clinics', href: '/admin/clinics', icon: Building2 },
  { label: 'Onboarding', href: '/admin/onboarding', icon: UserCheck },
  { label: 'Sales Reps', href: '/admin/sales-reps', icon: Users },
  { label: 'Batch POs', href: '/admin/batch', icon: Layers },
  { label: 'Suppliers', href: '/admin/suppliers', icon: Truck },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

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
            pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'text-steel-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
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

export function AdminSidebar() {
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
        <span className="text-xs text-accent-purple font-medium">Admin</span>
      </div>

      {/* Mobile overlay */}
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
              <p className="text-xs text-accent-purple font-medium mt-1">Admin Portal</p>
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
          <p className="text-xs text-accent-purple font-medium mt-1">Admin Portal</p>
        </div>
        <SidebarNav />
      </aside>
    </>
  )
}
