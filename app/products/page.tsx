import type { Metadata } from 'next'
import { CatalogContent } from './content'

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse the Matrix product catalog — peptides, exosomes, metabolic support, sexual health, regenerative products, and protocol bundles. For qualified clinics and providers only.',
}

export default function CatalogPage() {
  return <CatalogContent />
}
