'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { IconWrapper } from '@/components/ui/icon-wrapper'
import { trustItems } from '@/data/trust'

export function TrustStandards() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="Standards & Trust"
          title="Built for Professional Standards"
          description="Every product, process, and partnership at Matrix is designed around compliance, quality, and provider trust."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                <IconWrapper name={item.icon} size={18} className="text-accent-blue" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-steel-400 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
