'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Lock, ArrowRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FinalCTA } from '@/components/sections/final-cta'
import { products, productCategories, type Product } from '@/data/catalog'
import { trackCTA } from '@/lib/analytics/track'

export function CatalogContent() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !activeCategory || p.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Container>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Product Catalog</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Premium Clinical Products. Provider-Only Access.
            </h1>
            <p className="text-base sm:text-lg text-steel-400 leading-relaxed">
              Explore our product ecosystem. All products are available exclusively to credentialed clinics and licensed providers. Subject to credentialing and approval.
            </p>
          </motion.div>
        </Container>
      </section>

      <section className="pb-24 lg:pb-32">
        <Container>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-steel-500 focus:outline-none focus:ring-2 focus:ring-accent-purple"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${!activeCategory ? 'bg-accent-purple text-white' : 'bg-white/5 text-steel-400 hover:bg-white/10'}`}
            >
              All Categories
            </button>
            {productCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${cat.id === activeCategory ? 'bg-accent-purple text-white' : 'bg-white/5 text-steel-400 hover:bg-white/10'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              >
                <Card variant="interactive" glow className="h-full">
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{product.subcategory}</Badge>
                      {product.requiresCredentialing && <Lock size={14} className="text-steel-600" />}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-sm text-steel-400 leading-relaxed flex-1 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-steel-500">{product.format}</span>
                      <Link href="/contact?type=catalog" onClick={() => trackCTA(`inquire_${product.id}`, 'catalog')}>
                        <span className="text-xs text-accent-purple hover:text-accent-purple-light transition-colors">
                          Inquire <ArrowRight size={12} className="inline ml-0.5" />
                        </span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-steel-500">No products match your search. Try adjusting your filters.</p>
            </div>
          )}

          {/* Catalog CTA */}
          <div className="mt-16 text-center">
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/8 max-w-xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">Need Help With Your Category Mix?</h3>
              <p className="text-sm text-steel-400 mb-6">
                Our team can help you evaluate the right product categories for your clinic&apos;s goals and patient base.
              </p>
              <Link href="/contact?type=strategy">
                <Button onClick={() => trackCTA('catalog_strategy_call', 'catalog')}>
                  Book Strategy Call <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs text-steel-600 text-center mt-8">
            All products are designated for professional use only. Subject to credentialing, approval, and jurisdictional regulatory review. Not medical advice.
          </p>
        </Container>
      </section>

      <FinalCTA />
    </>
  )
}
