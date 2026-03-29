'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Building2, TrendingUp, Users, BarChart3, Megaphone, Wallet, Target, Repeat, ShoppingCart, HeartPulse } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FinalCTA } from '@/components/sections/final-cta'
import { trackCTA } from '@/lib/analytics/track'

const growthPillars = [
  { icon: Building2, title: 'Clinic Launch Support', description: 'Structured onboarding, credentialing guidance, and initial category setup for clinics entering advanced treatment spaces.' },
  { icon: TrendingUp, title: 'Category Expansion', description: 'Add peptides, exosomes, metabolic, sexual health, regenerative, and longevity categories to your existing practice with Matrix support.' },
  { icon: Wallet, title: 'Funding & Financing Support', description: 'Explore funding options and financing guidance to support clinic scaling, equipment, and inventory investment.' },
  { icon: Megaphone, title: 'Marketing & Patient Acquisition', description: 'Growth marketing frameworks, patient acquisition strategies, and brand positioning support for advanced clinics.' },
  { icon: Users, title: 'Provider Enablement', description: 'Education resources, protocol support, and clinical confidence building for providers adopting new treatment categories.' },
  { icon: BarChart3, title: 'Operational Systems', description: 'Inventory management, fulfillment workflows, and operational structure for day-to-day clinic excellence.' },
  { icon: Target, title: 'Strategic Account Management', description: 'Dedicated account support aligned with your clinic\'s long-term growth trajectory and expansion goals.' },
  { icon: Building2, title: 'Multi-Location Growth', description: 'Infrastructure and strategic support for clinics scaling from a single location to regional or national presence.' },
]

const funnelStages = [
  { icon: Megaphone, stage: 'Traffic & Awareness', description: 'Drive qualified patient attention through strategic positioning and marketing support.' },
  { icon: Target, stage: 'Interest & Inquiry', description: 'Convert awareness into qualified patient inquiries through structured intake systems.' },
  { icon: Users, stage: 'Consultation', description: 'Support provider confidence and patient education during the consultation process.' },
  { icon: HeartPulse, stage: 'Category Activation', description: 'Activate treatment categories with premium products and protocol support.' },
  { icon: ShoppingCart, stage: 'Fulfillment & Support', description: 'Execute orders, manage inventory, and maintain operational continuity.' },
  { icon: Repeat, stage: 'Retention & Expansion', description: 'Build long-term patient relationships and expand into additional treatment categories.' },
]

export function GrowthContent() {
  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Growth Infrastructure</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              More Than Supply. Matrix Builds the Infrastructure Around Clinic Growth.
            </h1>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed">
              From clinic launch to multi-location expansion — Matrix provides the operational, strategic, and marketing infrastructure clinics need to scale with confidence.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Growth Pillars */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="Enterprise Infrastructure" title="What Growth Infrastructure Means" description="Matrix goes beyond product supply. We build the systems, support, and strategy layer around every clinic we partner with." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {growthPillars.map((pillar, i) => (
              <motion.div key={pillar.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}>
                <Card variant="interactive" glow className="h-full">
                  <CardContent>
                    <div className="mb-3 w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                      <pillar.icon size={20} className="text-accent-purple" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{pillar.title}</h3>
                    <p className="text-sm text-steel-400 leading-relaxed">{pillar.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Clinic Growth Funnel */}
      <section className="py-20 lg:py-28 bg-navy-900/30">
        <Container>
          <SectionHeading eyebrow="Growth Lifecycle" title="The Clinic Growth Lifecycle" description="Matrix supports every stage of the clinic growth journey — from awareness to expansion." />
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnelStages.map((stage, i) => (
              <motion.div key={stage.stage} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                  <stage.icon size={16} className="text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{stage.stage}</h3>
                  <p className="text-xs text-steel-400 leading-relaxed">{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Scale */}
      <section className="py-20 lg:py-28">
        <Container size="narrow">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Scale With Confidence</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">From Single Clinic to Multi-Location Enterprise</h2>
            <p className="text-base text-steel-400 leading-relaxed mb-8">
              Whether you operate one clinic or twenty, Matrix scales with you. Our infrastructure supports single-location practices, growing groups, and enterprise-level clinic networks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/clinic-onboarding">
                <Button size="lg" onClick={() => trackCTA('start_onboarding', 'growth')}>Start Onboarding <ArrowRight size={16} /></Button>
              </Link>
              <Link href="/contact?type=strategy">
                <Button variant="secondary" size="lg" onClick={() => trackCTA('strategy_call', 'growth')}>Book Strategy Call</Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      <FinalCTA />
    </>
  )
}
