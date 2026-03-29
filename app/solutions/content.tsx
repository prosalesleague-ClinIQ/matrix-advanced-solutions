'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { IconWrapper } from '@/components/ui/icon-wrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FinalCTA } from '@/components/sections/final-cta'
import { solutions } from '@/data/solutions'
import { trackCTA } from '@/lib/analytics/track'

export function SolutionsContent() {
  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">
              Solutions
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Advanced Treatment Categories. Enterprise Support.
            </h1>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed">
              Matrix supports clinics across the highest-value categories in modern clinical practice — from peptides and exosomes to metabolic health and beyond.
            </p>
          </motion.div>
        </Container>
      </section>

      {solutions.map((solution, index) => (
        <section
          key={solution.id}
          id={solution.id}
          className={`py-20 lg:py-28 ${index % 2 === 1 ? 'bg-navy-900/30' : ''}`}
        >
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                      <IconWrapper name={solution.icon} size={20} />
                    </div>
                    <Badge variant="accent">{solution.title}</Badge>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                    {solution.subtitle}
                  </h2>

                  <p className="text-base text-steel-400 leading-relaxed mb-6">
                    {solution.description}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Who It Serves</h3>
                      <p className="text-sm text-steel-400">{solution.audience}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Why Clinics Add This Category</h3>
                      <p className="text-sm text-steel-400">{solution.whyAdd}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">How Matrix Supports</h3>
                      <p className="text-sm text-steel-400">{solution.matrixSupport}</p>
                    </div>
                  </div>

                  <Link href="/contact?type=catalog">
                    <Button onClick={() => trackCTA(`explore_${solution.id}`, 'solutions')}>
                      Explore {solution.title} <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-steel-500 mb-3">
                    Categories include
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {solution.categories.map((cat) => (
                      <div
                        key={cat}
                        className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-steel-300"
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-steel-600 mt-4">
                    Product and category availability subject to jurisdiction and regulatory review. Professional use only.
                  </p>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>
      ))}

      <FinalCTA />
    </>
  )
}
