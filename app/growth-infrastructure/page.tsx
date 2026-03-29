import type { Metadata } from 'next'
import { GrowthContent } from './content'

export const metadata: Metadata = {
  title: 'Growth Infrastructure',
  description:
    'Matrix provides clinic launch support, category expansion, marketing, funding guidance, and operational infrastructure. More than supply — enterprise growth systems for clinics.',
}

export default function GrowthInfrastructurePage() {
  return <GrowthContent />
}
