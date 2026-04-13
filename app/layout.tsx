import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { IntroOverlay } from '@/components/intro/intro-overlay'
import './globals.css'

// Routes that render their own portal chrome and should NOT get the marketing
// header/footer. Middleware sets `x-pathname` on every request.
const PORTAL_ROUTE_PREFIXES = [
  '/admin',
  '/dashboard',
  '/catalog',
  '/cart',
  '/checkout',
  '/orders',
  '/invoices',
  '/settings',
  '/onboarding',
  '/challenge',
  '/login',
  '/signup',
  '/verify-email',
  '/reset-password',
]

function isPortalRoute(pathname: string): boolean {
  return PORTAL_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a14',
}

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/'
  const isPortal = isPortalRoute(pathname)

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen bg-navy-950 text-steel-300 font-sans">
        {!isPortal && <IntroOverlay />}
        {!isPortal && <Header />}
        <main>{children}</main>
        {!isPortal && <Footer />}
      </body>
    </html>
  )
}
