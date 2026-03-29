'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Target, Shield, Layers, Users, Building2, Lightbulb } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FinalCTA } from '@/components/sections/final-cta'

const values = [
  { icon: Target, title: 'Strategic Partnership', description: 'We exist to grow alongside our clinic partners — not to transact and move on. Every decision is built around long-term mutual success.' },
  { icon: Shield, title: 'Compliance & Standards', description: 'Regulatory awareness, credentialing discipline, and professional standards are embedded in every operation.' },
  { icon: Layers, title: 'Infrastructure First', description: 'We build systems, not shortcuts. Operational infrastructure is the foundation of sustainable clinic growth.' },
  { icon: Users, title: 'Provider-Centered', description: 'Everything we build is designed for the provider experience — from onboarding to daily operations to expansion.' },
  { icon: Building2, title: 'Enterprise Vision', description: 'We support clinics at every scale, but we build for enterprise readiness from day one.' },
  { icon: Lightbulb, title: 'Category Leadership', description: 'We help clinics lead in high-value treatment categories — not just participate.' },
]

export function AboutContent() {
  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">About Matrix</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              The Infrastructure Behind Modern Clinic Growth
            </h1>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed">
              Matrix Advanced Solutions was built to solve a fundamental problem: advanced clinics need more than products. They need operational infrastructure, strategic support, and a partner invested in their long-term growth.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-28 bg-navy-900/30">
        <Container size="narrow">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Our Mission</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">Help Clinics Launch, Expand, and Scale Advanced Treatment Categories</h2>
            <p className="text-base text-steel-400 leading-relaxed">
              We provide the premium products, provider support, operational systems, and growth infrastructure that enable qualified clinics to build thriving practices in the most advanced treatment categories available today.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Evolution */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeading align="left" eyebrow="Our Evolution" title="From Supply to Infrastructure" />
              <div className="space-y-4 text-steel-400 text-sm leading-relaxed">
                <p>Matrix began as a product-focused partner for clinics entering advanced treatment categories. Over time, we recognized that product access alone was insufficient.</p>
                <p>Clinics needed onboarding support. They needed operational systems. They needed marketing guidance and strategic planning. They needed a partner, not a vendor.</p>
                <p>Today, Matrix is the enterprise infrastructure layer around clinic growth — supporting everything from credentialing to multi-location expansion.</p>
              </div>
            </div>
            <div>
              <SectionHeading align="left" eyebrow="What We Support" title="The Full Clinic Growth Stack" />
              <ul className="space-y-3">
                {['Premium clinical products across 8+ categories', 'Provider education and protocol support', 'Clinic onboarding and credentialing', 'Operational infrastructure and fulfillment', 'Marketing and patient acquisition support', 'Funding guidance and financial planning', 'Strategic account management', 'Multi-location scaling support'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-steel-400">
                    <ArrowRight size={14} className="text-accent-purple flex-shrink-0 mt-1" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-navy-900/30">
        <Container>
          <SectionHeading eyebrow="Our Principles" title="What Drives Matrix" description="Every decision, partnership, and product is guided by these principles." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value, i) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}>
                <Card variant="default" className="h-full">
                  <CardContent>
                    <div className="mb-3 w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                      <value.icon size={20} className="text-accent-purple" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-steel-400 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Leadership placeholder */}
      <section className="py-20 lg:py-28">
        <Container size="narrow">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Leadership</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">Built by Industry Operators</h2>
            <p className="text-base text-steel-400 leading-relaxed mb-8">
              Matrix is led by operators who understand the clinical landscape — the regulatory environment, the operational complexity, and the growth opportunities. Leadership profiles coming soon.
            </p>
            <Link href="/contact?type=strategy">
              <Button variant="secondary" size="lg">Connect With Us <ArrowRight size={16} /></Button>
            </Link>
          </motion.div>
        </Container>
      </section>

      <FinalCTA />
    </>
  )
}
