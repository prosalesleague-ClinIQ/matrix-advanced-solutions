import { Hero } from '@/components/sections/hero'
import { CapabilityStrip } from '@/components/sections/capability-strip'
import { WhyMatrix } from '@/components/sections/why-matrix'
import { EcosystemFlythrough } from '@/components/sections/ecosystem-flythrough'
import { SolutionsPreview } from '@/components/sections/solutions-preview'
import { GrowthPreview } from '@/components/sections/growth-preview'
import { CatalogPreview } from '@/components/sections/catalog-preview'
import { TrustStandards } from '@/components/sections/trust-standards'
import { FinalCTA } from '@/components/sections/final-cta'

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
