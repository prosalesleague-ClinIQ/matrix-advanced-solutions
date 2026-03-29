import type { Metadata } from 'next'
import { PeptideMapContent } from './content'

export const metadata: Metadata = {
  title: 'Peptide Map',
  description:
    'Explore the Matrix Peptide Map — a visual guide to therapeutic peptide categories, clinical applications, and protocol pathways for qualified providers.',
}

export default function PeptideMapPage() {
  return <PeptideMapContent />
}
