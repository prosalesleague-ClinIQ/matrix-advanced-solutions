'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { CheckCircle2 } from 'lucide-react'

const stages = [
  {
    step: '01',
    title: 'Qualification & Credentialing',
    description: 'Verify your clinic, confirm licensing, and establish your provider profile within the Matrix ecosystem.',
  },
  {
    step: '02',
    title: 'Category Access & Selection',
    description: 'Explore available treatment categories — peptides, exosomes, metabolic, sexual health, regenerative, longevity — and select your starting lineup.',
  },
  {
    step: '03',
    title: 'Onboarding & Activation',
    description: 'Receive operational orientation, account team introduction, initial product access, and platform setup.',
  },
  {
    step: '04',
    title: 'Provider Enablement',
    description: 'Access provider education resources, protocol support, and clinical guidance designed for your chosen categories.',
  },
  {
    step: '05',
    title: 'Operations & Fulfillment',
    description: 'Integrate with inventory systems, fulfillment workflows, and day-to-day operational support structures.',
  },
  {
    step: '06',
    title: 'Growth & Expansion',
    description: 'Activate marketing support, explore funding guidance, add categories, open new locations, and scale with Matrix infrastructure.',
  },
]

export function EcosystemFlythrough() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent-blue/[0.03] blur-3xl pointer-events-none" />

      <Container>
        <SectionHeading
          eyebrow="The Matrix Ecosystem"
          title="A Structured Path From Qualification to Scale"
          description="Matrix guides clinics through every phase of growth — from initial credentialing to multi-location expansion."
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-accent-blue/30 via-accent-blue/10 to-transparent hidden sm:block" />

          <div className="space-y-8">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-card border border-white/10 flex items-center justify-center group-hover:border-accent-blue/30 group-hover:bg-accent-blue/5 transition-all duration-300 z-10">
                  <span className="text-xs font-bold text-accent-blue">{stage.step}</span>
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-lg font-semibold text-white mb-1">{stage.title}</h3>
                  <p className="text-sm text-steel-400 leading-relaxed">{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
