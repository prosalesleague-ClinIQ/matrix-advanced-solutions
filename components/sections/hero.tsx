'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroScene } from '@/components/three/hero-scene'
import { SceneFallback } from '@/components/three/scene-fallback'
import { Container } from '@/components/ui/container'
import { trackCTA } from '@/lib/analytics/track'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      <Suspense fallback={<SceneFallback />}>
        <HeroScene />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent z-10" />

      <Container className="relative z-20 py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-6"
          >
            Enterprise Clinic Infrastructure
          </motion.p>

          {/* Primary headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08]"
          >
            The Infrastructure Behind{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-blue to-accent-purple">
              Modern Clinic Growth
            </span>
          </motion.h1>
          {/* Alternative headlines (preserved for A/B consideration):
              - Where Advanced Clinics Build Their Next Phase
              - Enterprise Support for the New Era of Clinics
          */}

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 text-base sm:text-lg text-steel-400 leading-relaxed max-w-2xl"
          >
            Matrix helps clinics expand high-value treatment categories with premium products,
            provider support, operational systems, and strategic growth infrastructure.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact?type=catalog">
              <Button size="lg" onClick={() => trackCTA('request_catalog', 'hero')}>
                Request Catalog
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/contact?type=strategy">
              <Button variant="secondary" size="lg" onClick={() => trackCTA('book_strategy_call', 'hero')}>
                Book Strategy Call
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-6 text-xs text-steel-600 text-center"
          >
            Professional use only. For qualified clinics and providers.
          </motion.p>
        </div>
      </Container>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent z-10" />
    </section>
  )
}
