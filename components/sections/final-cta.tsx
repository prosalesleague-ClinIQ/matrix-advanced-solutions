'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { trackCTA } from '@/lib/analytics/track'

export function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-blue/[0.05] blur-3xl pointer-events-none" />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-blue mb-6">
            Get Started
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
            Build the Next Phase of Your Clinic with Matrix
          </h2>
          <p className="text-base sm:text-lg text-steel-400 leading-relaxed mb-10">
            Whether you're launching your first advanced treatment category or scaling to multiple locations — Matrix provides the infrastructure to get you there.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact?type=catalog">
              <Button size="lg" onClick={() => trackCTA('request_catalog', 'final_cta')}>
                Request Catalog <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/contact?type=strategy">
              <Button variant="secondary" size="lg" onClick={() => trackCTA('book_strategy_call', 'final_cta')}>
                Book Strategy Call
              </Button>
            </Link>
            <Link href="/clinic-onboarding">
              <Button variant="ghost" size="lg" onClick={() => trackCTA('start_onboarding', 'final_cta')}>
                Start Onboarding
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-steel-600">
            Professional use only. Subject to credentialing and approval.
          </p>
        </motion.div>
      </Container>
    </section>
  )
}
