import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Matrix Advanced Solutions | Clinic Growth Infrastructure',
    template: '%s | Matrix Advanced Solutions',
  },
  description:
    'Matrix Advanced Solutions is the infrastructure behind modern clinic growth. Premium products, provider support, operational systems, and strategic growth infrastructure for qualified clinics.',
  keywords: [
    'clinic growth infrastructure',
    'peptide supplier for clinics',
    'exosome clinic partner',
    'clinic onboarding support',
    'provider solutions',
    'metabolic health clinic support',
    'regenerative medicine partner',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Matrix Advanced Solutions',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-navy-950 text-steel-300 font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
