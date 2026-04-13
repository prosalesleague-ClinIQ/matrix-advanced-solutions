import type { Metadata } from 'next'
import { CatalogContent } from './content'

const title = 'Products'
const description =
  'Browse the Matrix product catalog — peptides, exosomes, metabolic support, sexual health, regenerative products, and protocol bundles. For qualified clinics and providers only.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/products' },
  openGraph: { title, description, url: '/products' },
  twitter: { title, description },
}

export default function CatalogPage() {
  return <CatalogContent />
}
