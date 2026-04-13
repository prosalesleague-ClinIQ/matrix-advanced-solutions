import type { Metadata } from 'next'
import { SolutionsContent } from './content'

const title = 'Solutions'
const description =
  'Explore Matrix treatment categories — peptides, exosomes, metabolic, sexual health, regenerative, longevity, and clinic growth support. Enterprise infrastructure for qualified providers.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/solutions' },
  openGraph: { title, description, url: '/solutions' },
  twitter: { title, description },
}

export default function SolutionsPage() {
  return <SolutionsContent />
}
