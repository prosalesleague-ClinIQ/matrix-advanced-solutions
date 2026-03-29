'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, TrendingUp, Users, BarChart3, Megaphone, Wallet } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'

const pillars = [
  { icon: Building2, label: 'Clinic Launch', description: 'Structured onboarding for new clinics entering advanced treatment categories.' },
  { icon: TrendingUp, label: 'Category Expansion', description: 'Add peptides, exosomes, metabolic, and more to your existing practice.' },
  { icon: Megaphone, label: 'Marketing Support', description: 'Growth marketing guidance and patient acquisition frameworks.' },
  { icon: Wallet, label: 'Funding Guidance', description: 'Explore financing and funding support for clinic scaling.' },
  { icon: Users, label: 'Provider Enablement', description: 'Education, protocol support, and clinical confidence building.' },
  { icon: BarChart3, label: 'Multi-Location Growth', description: 'Infrastructure for clinics scaling from one to many locations.' },
]

export function GrowthPreview() {
  return (
    <section className="py-24 lg:py-32 relative">
      <Container>
        <SectionHeading
          eyebrow="Growth Infrastructure"
          title="More Than Supply. Matrix Builds the Infrastructure Around Clinic Growth."
          description="From launch to multi-location expansion — Matrix provides the operational, strategic, and marketing infrastructure clinics need to scale."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                <pillar.icon size={20} className="text-accent-purple" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{pillar.label}</h3>
                <p className="text-sm text-steel-400 leading-relaxed">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/growth-infrastructure">
            <Button variant="secondary" size="lg">
              Explore Growth Infrastructure <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
