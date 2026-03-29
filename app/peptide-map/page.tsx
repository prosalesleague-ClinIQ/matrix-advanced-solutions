import type { Metadata } from 'next'
import { PeptideMapPage as PeptideMapView } from '@/components/peptide-map/peptide-map-page'

export const metadata: Metadata = {
  title: 'Peptide Map',
  description:
    'Explore the Matrix Peptide Map — an interactive 3D guide to therapeutic peptide categories, biological systems, and clinical applications for qualified providers.',
}

export default function PeptideMapRoute() {
  return <PeptideMapView />
}
