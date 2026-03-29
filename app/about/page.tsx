import type { Metadata } from 'next'
import { AboutContent } from './content'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Matrix Advanced Solutions is the infrastructure behind modern clinic growth. Learn about our mission, strategic philosophy, and enterprise vision.',
}

export default function AboutPage() {
  return <AboutContent />
}
