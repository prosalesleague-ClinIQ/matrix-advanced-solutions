'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Target, Activity, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trackCTA } from '@/lib/analytics/track'

const benefits = [
  { icon: Shield, title: 'Muscle Preservation', description: 'Supports lean tissue preservation during metabolic health protocols and caloric restriction phases.' },
  { icon: Activity, title: 'Recovery Optimization', description: 'Designed to support faster recovery and reduced downtime between clinical treatment phases.' },
  { icon: TrendingUp, title: 'Performance Support', description: 'Helps maintain strength and functional capacity during advanced treatment programs.' },
  { icon: Target, title: 'Protocol Integration', description: 'Engineered to complement existing clinical protocols — peptide, metabolic, and performance programs.' },
]

const clinicalApplications = [
  'GLP-1 / metabolic health programs where lean mass preservation is a priority',
  'Performance and recovery protocols in sports medicine and optimization clinics',
  'Anti-aging and longevity programs requiring muscle and functional support',
  'Post-surgical recovery protocols under qualified clinical supervision',
  'Comprehensive body composition programs combining multiple treatment modalities',
]

const differentiators = [
  { title: 'Clinical-Grade Formulation', description: 'Developed for professional clinical environments, not consumer retail.' },
  { title: 'Protocol-Ready Design', description: 'Structured for integration into existing clinical treatment pathways.' },
  { title: 'Provider-Exclusive Access', description: 'Available only to credentialed clinics through the Matrix ecosystem.' },
  { title: 'Compliance-Forward', description: 'Designed with regulatory awareness and professional standards built in.' },
]

export function MuscleLockContent() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-accent-cyan/[0.03] blur-3xl" />

        <Container className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <Zap size={24} className="text-white" />
              </div>
              <Badge variant="accent">Flagship Product</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              MuscleLock
            </h1>
            <p className="text-xl sm:text-2xl text-steel-300 font-medium mb-4">
              Premium Muscle Preservation & Recovery Support
            </p>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed mb-8">
              MuscleLock is designed for clinics offering advanced metabolic, performance, and recovery protocols. A clinical-grade solution for providers who need muscle preservation support integrated into their treatment programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact?type=catalog">
                <Button size="lg" onClick={() => trackCTA('inquire_musclelock', 'musclelock')}>
                  Inquire About MuscleLock <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/contact?type=strategy">
                <Button variant="secondary" size="lg" onClick={() => trackCTA('strategy_call', 'musclelock')}>
                  Discuss Integration
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-steel-600">
              Professional use only. For qualified clinics and providers. Subject to credentialing and approval.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="Core Benefits" title="Why Clinics Choose MuscleLock" description="Designed to address the most critical support needs in advanced clinical treatment programs." />
          <div className="grid sm:grid-cols-2 gap-5">
            {benefits.map((benefit, i) => (
              <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card variant="interactive" glow className="h-full">
                  <CardContent className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                      <benefit.icon size={20} className="text-accent-purple" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-sm text-steel-400 leading-relaxed">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Clinical Applications */}
      <section className="py-20 lg:py-28 bg-navy-900/30">
        <Container size="narrow">
          <SectionHeading eyebrow="Clinical Applications" title="Where MuscleLock Fits" description="Designed for integration across multiple clinical treatment pathways." />
          <div className="space-y-3">
            {clinicalApplications.map((app, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <CheckCircle2 size={16} className="text-accent-purple flex-shrink-0 mt-0.5" />
                <p className="text-sm text-steel-400">{app}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Differentiators */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="What Sets MuscleLock Apart" title="Built for Clinical Excellence" />
          <div className="grid sm:grid-cols-2 gap-5">
            {differentiators.map((diff, i) => (
              <motion.div key={diff.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <h3 className="text-sm font-semibold text-white mb-1">{diff.title}</h3>
                <p className="text-sm text-steel-400 leading-relaxed">{diff.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-navy-900/30">
        <Container size="narrow">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Add MuscleLock to Your Clinical Program
            </h2>
            <p className="text-base text-steel-400 leading-relaxed mb-8">
              Contact our team to learn about MuscleLock availability, clinical integration support, and provider pricing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact?type=catalog">
                <Button size="lg" onClick={() => trackCTA('request_catalog', 'musclelock')}>
                  Request Product Information <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/clinic-onboarding">
                <Button variant="secondary" size="lg">
                  Start Onboarding
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-steel-600">
              MuscleLock is available exclusively to qualified, credentialed providers through the Matrix ecosystem. Not for consumer sale.
            </p>
          </motion.div>
        </Container>
      </section>
    </>
  )
}
