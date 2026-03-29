import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/hero'
import { CapabilityStrip } from '@/components/sections/capability-strip'

// Lazy load below-fold sections to reduce initial JS bundle
const WhyMatrix = dynamic(() => import('@/components/sections/why-matrix').then(m => ({ default: m.WhyMatrix })))
const EcosystemFlythrough = dynamic(() => import('@/components/sections/ecosystem-flythrough').then(m => ({ default: m.EcosystemFlythrough })))
const SolutionsPreview = dynamic(() => import('@/components/sections/solutions-preview').then(m => ({ default: m.SolutionsPreview })))
const GrowthPreview = dynamic(() => import('@/components/sections/growth-preview').then(m => ({ default: m.GrowthPreview })))
const CatalogPreview = dynamic(() => import('@/components/sections/catalog-preview').then(m => ({ default: m.CatalogPreview })))
const TrustStandards = dynamic(() => import('@/components/sections/trust-standards').then(m => ({ default: m.TrustStandards })))
const FinalCTA = dynamic(() => import('@/components/sections/final-cta').then(m => ({ default: m.FinalCTA })))

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilityStrip />
      <WhyMatrix />
      <EcosystemFlythrough />
      <SolutionsPreview />
      <GrowthPreview />
      <CatalogPreview />
      <TrustStandards />
      <FinalCTA />
    </>
  )
}
