export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
}

export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Products', href: '/products' },
  // Cross-site nav: /catalog 302s to the matrix-store deployment via
  // vercel.json. Resources points at the static reference site.
  { label: 'Shop', href: '/catalog' },
  { label: 'Resources', href: 'https://matrix-clinic-resource-center.vercel.app/' },
  { label: 'Growth Infrastructure', href: '/growth-infrastructure' },
  { label: 'Peptide Map', href: '/peptide-map' },
  { label: 'MuscleLock', href: '/musclelock' },
  { label: 'Onboarding', href: '/clinic-onboarding' },
  { label: 'Contact', href: '/contact' },
]

export const headerCTAs = [
  {
    label: 'Request Catalog',
    trackingId: 'request_catalog',
    href: '/request-catalog',
    variant: 'primary' as const,
  },
  {
    label: 'Strategy Call',
    trackingId: 'strategy_call',
    href: '/contact?type=strategy',
    variant: 'secondary' as const,
  },
  {
    label: 'Start Onboarding',
    trackingId: 'start_onboarding',
    href: '/clinic-onboarding',
    variant: 'ghost' as const,
  },
]

export const footerNav = {
  solutions: [
    { label: 'Peptides', href: '/solutions#peptides' },
    { label: 'Exosomes', href: '/solutions#exosomes' },
    { label: 'Metabolic / GLP Support', href: '/solutions#metabolic' },
    { label: 'Sexual Health', href: '/solutions#sexual-health' },
    { label: 'Regenerative', href: '/solutions#regenerative' },
    { label: 'Longevity & Performance', href: '/solutions#longevity' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Growth Infrastructure', href: '/growth-infrastructure' },
    { label: 'Clinic Onboarding', href: '/clinic-onboarding' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Shop', href: '/catalog' },
    { label: 'Resource Center', href: 'https://matrix-clinic-resource-center.vercel.app/' },
    { label: 'Products', href: '/products' },
    { label: 'Peptide Map', href: '/peptide-map' },
    { label: 'MuscleLock', href: '/musclelock' },
    { label: 'Provider Login', href: '/login' },
  ],
  legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Contact Us', href: '/contact' },
  ],
}
