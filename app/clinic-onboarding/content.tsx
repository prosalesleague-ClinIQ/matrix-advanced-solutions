'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Shield, Users, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingForm } from '@/components/forms/onboarding-form'
import { onboardingFAQs } from '@/data/faqs'

const onboardingIncludes = [
  { icon: Shield, title: 'Credentialing & Verification', description: 'Provider license verification, clinic documentation, and compliance review.' },
  { icon: CheckCircle2, title: 'Category Access Setup', description: 'Select and activate your initial treatment categories — peptides, exosomes, metabolic, and more.' },
  { icon: Users, title: 'Account Team Introduction', description: 'Meet your dedicated account team for ongoing strategic support and operational guidance.' },
  { icon: Clock, title: 'Operational Orientation', description: 'Platform setup, ordering workflows, fulfillment overview, and inventory guidance.' },
]

const timeline = [
  { step: '1', title: 'Submit Application', description: 'Complete the onboarding form with your clinic profile and category interests.' },
  { step: '2', title: 'Credentialing Review', description: 'Our team verifies your licensing, documentation, and eligibility.' },
  { step: '3', title: 'Category & Account Setup', description: 'Activate your product categories and configure your account.' },
  { step: '4', title: 'Orientation & First Order', description: 'Complete your operational orientation and place your first order with support.' },
]

export function OnboardingContent() {
  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-blue mb-4">Clinic Onboarding</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Start Your Partnership with Matrix
            </h1>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed">
              Our onboarding process is designed to get your clinic credentialed, set up, and operationally ready with minimal friction. Most clinics complete onboarding within 5–10 business days.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* What's Included */}
      <section className="py-20 lg:py-28 bg-navy-900/30">
        <Container>
          <SectionHeading eyebrow="What's Included" title="Your Onboarding Package" description="Everything you need to get started with Matrix — from credentialing to your first order." />
          <div className="grid sm:grid-cols-2 gap-5">
            {onboardingIncludes.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card variant="default" className="h-full">
                  <CardContent className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                      <item.icon size={20} className="text-accent-blue" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-steel-400 leading-relaxed">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28">
        <Container size="narrow">
          <SectionHeading eyebrow="Timeline" title="How Onboarding Works" description="A straightforward process from application to first order." />
          <div className="space-y-6">
            {timeline.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-5 items-start"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-blue">{step.step}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-steel-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Form */}
      <section id="onboarding-form" className="py-20 lg:py-28 bg-navy-900/30">
        <Container size="narrow">
          <SectionHeading eyebrow="Get Started" title="Begin Your Onboarding" description="Complete the form below and our team will begin your credentialing review." />
          <div className="relative">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-white/8">
              <OnboardingForm />
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <Container size="narrow">
          <SectionHeading eyebrow="FAQ" title="Common Questions" />
          <div className="space-y-4">
            {onboardingFAQs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-white list-none">
                  {faq.question}
                  <ArrowRight size={14} className="text-steel-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-steel-400 leading-relaxed">{faq.answer}</p>
              </motion.details>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
