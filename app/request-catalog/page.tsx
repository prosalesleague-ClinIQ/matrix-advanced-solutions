import type { Metadata } from 'next'
import { RequestCatalogContent } from './content'

export const metadata: Metadata = {
  title: 'Request Catalog | Matrix Advanced Solutions',
  description: 'Request the full Matrix Advanced Solutions product catalog and pricing. For qualified clinics and providers.',
}

export default function RequestCatalogPage() {
  return <RequestCatalogContent />
}
