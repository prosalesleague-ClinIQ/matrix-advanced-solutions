import type { Metadata } from 'next'
import { SolutionsContent } from './content'

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'Explore Matrix treatment categories — peptides, exosomes, metabolic, sexual health, regenerative, longevity, and clinic growth support. Enterprise infrastructure for qualified providers.',
}

export default function SolutionsPage() {
  return <SolutionsContent />
}
