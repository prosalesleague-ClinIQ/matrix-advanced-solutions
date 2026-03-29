import type { Metadata } from 'next'
import { ContactContent } from './content'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Matrix Advanced Solutions. Request a catalog, book a strategy call, inquire about products, or start clinic onboarding.',
}

export default function ContactPage() {
  return <ContactContent />
}
