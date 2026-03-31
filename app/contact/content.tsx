'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, PhoneCall, MessageSquare, Building2, Users, Mail } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { ContactForm } from '@/components/forms/contact-form'

const inquiryPaths = [
  { id: 'catalog', icon: BookOpen, title: 'Request Catalog', description: 'Get access to our full product catalog and pricing.', redirect: '/request-catalog' },
  { id: 'strategy', icon: PhoneCall, title: 'Strategic Partnership', description: 'Discuss growth strategy, expansion plans, or enterprise partnership.', endpoint: '/api/strategy-call', formName: 'strategy_call' },
  { id: 'product', icon: MessageSquare, title: 'Product Questions', description: 'Ask about specific products, categories, or protocol support.', endpoint: '/api/contact', formName: 'product_inquiry' },
  { id: 'growth', icon: Building2, title: 'Growth Infrastructure', description: 'Learn about marketing support, funding, and operational systems.', endpoint: '/api/contact', formName: 'growth_inquiry' },
  { id: 'onboarding', icon: Users, title: 'Clinic Onboarding', description: 'Start your credentialing and onboarding process.', endpoint: '/api/clinic-onboarding', formName: 'clinic_onboarding' },
  { id: 'general', icon: Mail, title: 'General Contact', description: 'Any other questions or partnership inquiries.', endpoint: '/api/contact', formName: 'general_contact' },
]

export function ContactContent() {
  const router = useRouter()
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const activePath = inquiryPaths.find((p) => p.id === selectedPath)

  function handlePathSelect(path: typeof inquiryPaths[number]) {
    if ('redirect' in path && path.redirect) {
      router.push(path.redirect as string)
    } else {
      setSelectedPath(path.id)
    }
  }

  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Contact</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Let&apos;s Talk About Your Clinic&apos;s Growth
            </h1>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed">
              Whether you&apos;re requesting catalog access, exploring a strategic partnership, or ready to start onboarding — we&apos;re here to help.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Inquiry Routing */}
      {!selectedPath && (
        <section className="pb-24 lg:pb-32">
          <Container>
            <SectionHeading eyebrow="How Can We Help?" title="Select Your Inquiry Type" description="Choose the option that best describes what you're looking for." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {inquiryPaths.map((path, i) => (
                <motion.div key={path.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <button onClick={() => handlePathSelect(path)} className="w-full text-left">
                    <Card variant="interactive" glow className="h-full">
                      <CardContent>
                        <div className="mb-3 w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                          <path.icon size={20} className="text-accent-purple" />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">{path.title}</h3>
                        <p className="text-sm text-steel-400 leading-relaxed">{path.description}</p>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Form */}
      {selectedPath && activePath && (
        <section className="pb-24 lg:pb-32">
          <Container size="narrow">
            <div className="mb-8">
              <button onClick={() => setSelectedPath(null)} className="text-sm text-accent-purple hover:text-accent-purple-light transition-colors mb-4 inline-block">
                &larr; Back to inquiry options
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">{activePath.title}</h2>
              <p className="text-sm text-steel-400">{activePath.description}</p>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-white/8">
              <ContactForm
                inquiryType={activePath.id}
                endpoint={activePath.endpoint}
                formName={activePath.formName}
              />
            </div>
          </Container>
        </section>
      )}

      {/* Calendar placeholder */}
      <section className="py-16 bg-navy-900/30">
        <Container size="narrow">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-steel-500 mb-2">Prefer to talk directly?</p>
            <p className="text-base text-steel-400">
              Calendar scheduling coming soon. In the meantime, submit a strategy call request above and our team will coordinate a time.
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
