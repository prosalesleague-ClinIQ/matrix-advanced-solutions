export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
}

export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Catalog', href: '/catalog' },
  { label: 'Growth Infrastructure', href: '/growth-infrastructure' },
  { label: 'Peptide Map', href: '/peptide-map' },
  { label: 'MuscleLock', href: '/musclelock' },
  { label: 'Onboarding', href: '/clinic-onboarding' },
  { label: 'Contact', href: '/contact' },
]

export const headerCTAs = [
  { label: 'Request Catalog', href: '/contact?type=catalog', variant: 'primary' as const },
  { label: 'Strategy Call', href: '/contact?type=strategy', variant: 'secondary' as const },
  { label: 'Start Onboarding', href: '/clinic-onboarding', variant: 'ghost' as const },
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
    { label: 'Catalog', href: '/catalog' },
    { label: 'Peptide Map', href: '/peptide-map' },
    { label: 'MuscleLock', href: '/musclelock' },
    { label: 'Provider Portal', href: '#' },
  ],
  legal: [
    { label: 'Compliance', href: '/compliance' },
    { label: 'Privacy', href: '/privacy' },
  ],
}
