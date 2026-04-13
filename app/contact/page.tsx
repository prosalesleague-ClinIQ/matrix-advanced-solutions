import type { Metadata } from 'next'
import { ContactContent } from './content'

const title = 'Contact'
const description =
  'Contact Matrix Advanced Solutions. Request a catalog, book a strategy call, inquire about products, or start clinic onboarding.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: { title, description, url: '/contact' },
  twitter: { title, description },
}

export default function ContactPage() {
  return <ContactContent />
}
