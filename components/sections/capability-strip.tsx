'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { capabilityStrip } from '@/data/trust'

export function CapabilityStrip() {
  return (
    <section className="relative py-16 border-y border-white/5 bg-navy-950/80">
      <Container>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {capabilityStrip.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="flex items-center justify-center px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300"
            >
              <span className="text-sm text-steel-300 font-medium text-center">{item}</span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
