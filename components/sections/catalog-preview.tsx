'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { productCategories } from '@/data/catalog'

export function CatalogPreview() {
  return (
    <section className="py-24 lg:py-32 bg-navy-900/30">
      <Container>
        <SectionHeading
          eyebrow="Product Catalog"
          title="Premium Clinical Products. Provider-Only Access."
          description="Explore our full product ecosystem — peptides, exosomes, metabolic support, and more. Available exclusively to credentialed clinics."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <Link href={`/catalog?category=${cat.id}`}>
                <div className="p-5 rounded-2xl bg-surface-card border border-white/8 hover:border-white/15 hover:bg-surface-elevated transition-all duration-300 group cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                    <Lock size={14} className="text-steel-600" />
                  </div>
                  <p className="text-xs text-steel-500 leading-relaxed mb-3">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{cat.productCount} products</Badge>
                    <ArrowRight size={14} className="text-steel-600 group-hover:text-accent-blue group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/catalog">
            <Button variant="primary" size="lg">
              Request Full Catalog <ArrowRight size={16} />
            </Button>
          </Link>
          <p className="mt-3 text-xs text-steel-600">Subject to credentialing and approval.</p>
        </div>
      </Container>
    </section>
  )
}
