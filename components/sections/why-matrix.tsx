'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { IconWrapper } from '@/components/ui/icon-wrapper'
import { whyMatrixCards } from '@/data/trust'

export function WhyMatrix() {
  return (
    <section className="py-24 lg:py-32 relative">
      <Container>
        <SectionHeading
          eyebrow="Why Matrix"
          title="More Than Supply. A Strategic Growth Partner."
          description="Matrix provides the infrastructure clinics need to launch, expand, and scale advanced treatment categories — from products to operations to enterprise support."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyMatrixCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card variant="interactive" glow className="h-full">
                <CardContent>
                  <div className="mb-4 w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                    <IconWrapper name={card.icon} size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-steel-400 leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
