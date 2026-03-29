'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { primaryNav, headerCTAs } from '@/data/navigation'
import { cn } from '@/lib/utils'
import { trackCTA } from '@/lib/analytics/track'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-xl border-b border-white/5" />
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Matrix<span className="text-steel-400 font-normal ml-1 hidden sm:inline">Advanced Solutions</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {primaryNav.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-steel-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {headerCTAs.map((cta) => (
              <Link key={cta.href} href={cta.href}>
                <Button
                  variant={cta.variant}
                  size="sm"
                  onClick={() => trackCTA(cta.label, 'header')}
                >
                  {cta.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden relative bg-navy-950/98 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-sm text-steel-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  {item.label}
                  <ChevronRight size={16} className="text-steel-600" />
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {headerCTAs.map((cta) => (
                  <Link key={cta.href} href={cta.href} onClick={() => setMobileOpen(false)}>
                    <Button variant={cta.variant} size="md" className="w-full">
                      {cta.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
