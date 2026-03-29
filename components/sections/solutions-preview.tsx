'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { IconWrapper } from '@/components/ui/icon-wrapper'
import { Button } from '@/components/ui/button'
import { solutions } from '@/data/solutions'

export function SolutionsPreview() {
  return (
    <section className="py-24 lg:py-32 bg-navy-900/30">
      <Container>
        <SectionHeading
          eyebrow="Solutions"
          title="Advanced Treatment Categories. Enterprise Support."
          description="Matrix supports clinics across the highest-value categories in modern clinical practice."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.slice(0, 6).map((sol, i) => (
            <motion.div
              key={sol.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <Card variant="interactive" glow className="h-full">
                <CardContent className="flex flex-col h-full">
                  <div className="mb-4 w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                    <IconWrapper name={sol.icon} size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{sol.title}</h3>
                  <p className="text-sm text-steel-400 leading-relaxed flex-1">{sol.subtitle}</p>
                  <Link
                    href={`/solutions#${sol.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-blue hover:text-accent-cyan transition-colors"
                  >
                    Learn more <ArrowRight size={14} />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/solutions">
            <Button variant="secondary" size="lg">
              View All Solutions <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
