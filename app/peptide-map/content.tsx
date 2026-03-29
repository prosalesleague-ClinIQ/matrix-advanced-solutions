'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, ArrowRight, ChevronDown, BookOpen, Shield } from 'lucide-react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trackCTA } from '@/lib/analytics/track'

const peptideCategories = [
  {
    id: 'growth-hormone',
    name: 'Growth Hormone Secretagogues',
    description: 'Peptides that stimulate natural growth hormone production for optimization protocols.',
    peptides: [
      { name: 'CJC-1295', use: 'Growth hormone releasing hormone analog', applications: ['Anti-aging', 'Body composition', 'Recovery'] },
      { name: 'Ipamorelin', use: 'Selective growth hormone secretagogue', applications: ['Optimization', 'Sleep', 'Recovery'] },
      { name: 'Tesamorelin', use: 'GHRH analog', applications: ['Metabolic support', 'Body composition'] },
      { name: 'Sermorelin', use: 'Growth hormone releasing peptide', applications: ['Anti-aging', 'Wellness'] },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery & Tissue Support',
    description: 'Peptides supporting tissue repair, recovery, and regenerative processes.',
    peptides: [
      { name: 'BPC-157', use: 'Body Protection Compound', applications: ['Tissue repair', 'GI support', 'Recovery'] },
      { name: 'TB-500', use: 'Thymosin Beta-4 fragment', applications: ['Tissue healing', 'Flexibility', 'Recovery'] },
      { name: 'GHK-Cu', use: 'Copper peptide complex', applications: ['Tissue remodeling', 'Skin health', 'Regenerative'] },
    ],
  },
  {
    id: 'metabolic',
    name: 'Metabolic & Weight Management',
    description: 'Peptides supporting metabolic health, weight management, and body composition protocols.',
    peptides: [
      { name: 'Semaglutide', use: 'GLP-1 receptor agonist', applications: ['Weight management', 'Metabolic health'] },
      { name: 'Tirzepatide', use: 'Dual GLP-1/GIP agonist', applications: ['Metabolic support', 'Weight management'] },
      { name: 'AOD-9604', use: 'Modified GH fragment', applications: ['Body composition', 'Metabolic support'] },
    ],
  },
  {
    id: 'immune',
    name: 'Immune Modulation',
    description: 'Peptides supporting immune system function and modulation.',
    peptides: [
      { name: 'Thymosin Alpha-1', use: 'Immune modulator', applications: ['Immune support', 'Wellness'] },
      { name: 'LL-37', use: 'Antimicrobial peptide', applications: ['Immune defense', 'Biofilm support'] },
    ],
  },
  {
    id: 'sexual-health',
    name: 'Sexual Health & Wellness',
    description: 'Peptides supporting sexual function and wellness protocols.',
    peptides: [
      { name: 'PT-141 (Bremelanotide)', use: 'Melanocortin receptor agonist', applications: ['Sexual health', 'Wellness'] },
      { name: 'Oxytocin', use: 'Neuropeptide', applications: ['Bonding', 'Wellness', 'Sexual health'] },
    ],
  },
  {
    id: 'longevity',
    name: 'Longevity & Neuroprotection',
    description: 'Peptides supporting cellular health, longevity, and neuroprotective protocols.',
    peptides: [
      { name: 'Epitalon', use: 'Telomerase activator', applications: ['Longevity', 'Cellular health'] },
      { name: 'Selank', use: 'Neuropeptide', applications: ['Cognitive support', 'Stress management'] },
      { name: 'Semax', use: 'Neuropeptide analog', applications: ['Cognitive support', 'Neuroprotection'] },
      { name: 'DIHEXA', use: 'Angiotensin IV analog', applications: ['Cognitive support', 'Neuroprotection'] },
    ],
  },
]

export function PeptideMapContent() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('growth-hormone')

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-blue/[0.04] blur-3xl" />

        <Container className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center">
                <Dna size={24} className="text-accent-blue" />
              </div>
              <Badge variant="accent">Flagship Resource</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              The Peptide Map
            </h1>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed mb-4">
              A structured guide to therapeutic peptide categories, clinical applications, and protocol pathways. Designed for qualified providers evaluating or expanding peptide therapy programs.
            </p>
            <p className="text-xs text-steel-600">
              For professional audiences only. Not medical advice. All peptides subject to availability, credentialing, and jurisdictional review.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Peptide Categories */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="space-y-4">
            {peptideCategories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full text-left p-5 sm:p-6 rounded-2xl bg-surface-card border border-white/8 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{category.name}</h2>
                      <p className="text-sm text-steel-400 mt-1">{category.description}</p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-steel-500 transition-transform flex-shrink-0 ml-4 ${expandedCategory === category.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCategory === category.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid sm:grid-cols-2 gap-4 pt-4 pl-2">
                        {category.peptides.map((peptide) => (
                          <Card key={peptide.name} variant="default" className="border-white/5">
                            <CardContent>
                              <h3 className="text-base font-semibold text-white mb-1">{peptide.name}</h3>
                              <p className="text-xs text-steel-500 mb-3">{peptide.use}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {peptide.applications.map((app) => (
                                  <Badge key={app} variant="outline">{app}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-navy-900/30">
        <Container size="narrow">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <BookOpen size={20} className="text-accent-blue" />
              <Shield size={20} className="text-accent-blue" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to Build Your Peptide Program?
            </h2>
            <p className="text-base text-steel-400 leading-relaxed mb-8">
              Matrix supports clinics at every stage of peptide category development — from initial protocol selection to full program scaling.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact?type=catalog">
                <Button size="lg" onClick={() => trackCTA('request_catalog', 'peptide_map')}>
                  Request Peptide Catalog <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/contact?type=strategy">
                <Button variant="secondary" size="lg" onClick={() => trackCTA('strategy_call', 'peptide_map')}>
                  Book Strategy Call
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-steel-600">
              All peptides subject to credentialing, approval, and jurisdictional regulatory review. Professional use only.
            </p>
          </motion.div>
        </Container>
      </section>
    </>
  )
}
