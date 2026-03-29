export type Solution = {
  id: string
  title: string
  subtitle: string
  description: string
  audience: string
  whyAdd: string
  matrixSupport: string
  icon: string
  categories: string[]
}

export const solutions: Solution[] = [
  {
    id: 'peptides',
    title: 'Peptides',
    subtitle: 'Advanced Peptide Therapy Support',
    description: 'Access a comprehensive peptide catalog designed for qualified providers expanding into targeted therapeutic and optimization protocols.',
    audience: 'Clinics offering hormone optimization, anti-aging, metabolic support, and performance protocols.',
    whyAdd: 'Peptide therapy is one of the fastest-growing categories in advanced clinical practice. Clinics that add peptides position themselves for sustained patient demand and higher-value treatment plans.',
    matrixSupport: 'Matrix provides product access, provider education resources, compliance guidance, and operational support to help clinics integrate peptides with confidence.',
    icon: 'Dna',
    categories: ['BPC-157', 'CJC/Ipamorelin', 'Semaglutide', 'Thymosin Alpha-1', 'PT-141', 'AOD-9604'],
  },
  {
    id: 'exosomes',
    title: 'Exosomes',
    subtitle: 'Regenerative Exosome Solutions',
    description: 'Premium exosome products for clinics building or expanding regenerative treatment categories under qualified clinical supervision.',
    audience: 'Regenerative medicine clinics, orthopedic practices, aesthetic providers, and integrative health centers.',
    whyAdd: 'Exosome therapies represent a frontier in regenerative medicine. Early-adopting clinics gain category leadership and patient trust in high-value treatment offerings.',
    matrixSupport: 'Matrix supports exosome category expansion with premium product access, clinical education resources, and operational onboarding tailored to regenerative workflows.',
    icon: 'CircleDot',
    categories: ['Regenerative', 'Aesthetic', 'Orthopedic', 'Hair Restoration'],
  },
  {
    id: 'metabolic',
    title: 'Metabolic / GLP Support',
    subtitle: 'Metabolic Health & Weight Management',
    description: 'Support clinics offering GLP-1 receptor agonist protocols and broader metabolic health programs with premium product access and operational infrastructure.',
    audience: 'Weight management clinics, endocrinology practices, primary care providers expanding into metabolic health.',
    whyAdd: 'Metabolic health and GLP-1 protocols represent one of the largest growth opportunities in clinical practice today. Clinics that build structured metabolic programs capture significant patient volume.',
    matrixSupport: 'Matrix provides product access, dosing protocol resources, patient management guidance, and category-specific marketing support for metabolic programs.',
    icon: 'Activity',
    categories: ['Semaglutide', 'Tirzepatide', 'Metabolic Panels', 'Protocol Support'],
  },
  {
    id: 'sexual-health',
    title: 'Sexual Health',
    subtitle: 'Sexual Wellness & Performance',
    description: 'Premium products and protocol support for clinics offering sexual health and performance optimization services to qualified patients.',
    audience: 'Men\'s health clinics, women\'s wellness centers, urology practices, and integrative providers.',
    whyAdd: 'Sexual health is a high-demand, high-retention treatment category. Clinics with structured sexual health programs build long-term patient relationships and recurring revenue.',
    matrixSupport: 'Matrix supports sexual health category development with discreet product access, provider education, compliance resources, and patient retention frameworks.',
    icon: 'Heart',
    categories: ['PT-141', 'Oxytocin', 'Testosterone Support', 'Protocol Bundles'],
  },
  {
    id: 'regenerative',
    title: 'Regenerative Support',
    subtitle: 'Regenerative Medicine Infrastructure',
    description: 'Comprehensive regenerative product access and clinical support for practices building advanced regenerative treatment programs.',
    audience: 'Orthopedic clinics, sports medicine practices, aesthetic centers, and integrative health providers.',
    whyAdd: 'Regenerative medicine offers differentiation and premium treatment positioning. Clinics that add structured regenerative categories attract higher-value patients seeking cutting-edge care.',
    matrixSupport: 'Matrix provides regenerative product access, clinical resources, category onboarding, and growth infrastructure for practices at every stage of regenerative program development.',
    icon: 'Sparkles',
    categories: ['Exosomes', 'Growth Factors', 'Tissue Support', 'Recovery Protocols'],
  },
  {
    id: 'longevity',
    title: 'Longevity & Performance',
    subtitle: 'Longevity, Optimization & Recovery',
    description: 'Support clinics offering longevity protocols, performance optimization, and advanced recovery programs with premium products and operational guidance.',
    audience: 'Longevity clinics, biohacking centers, sports performance practices, and executive health programs.',
    whyAdd: 'Longevity and performance medicine is a rapidly expanding category with high patient lifetime value. Clinics that structure these programs attract affluent, committed patient populations.',
    matrixSupport: 'Matrix supports longevity program development with curated product access, protocol resources, category education, and growth infrastructure for performance-focused practices.',
    icon: 'Zap',
    categories: ['NAD+', 'Peptide Stacks', 'Recovery Protocols', 'Optimization Panels'],
  },
  {
    id: 'clinic-growth',
    title: 'Clinic Growth Support',
    subtitle: 'Strategic Growth Infrastructure',
    description: 'Beyond product supply — Matrix provides the operational systems, marketing support, funding guidance, and strategic infrastructure clinics need to scale.',
    audience: 'Clinics at any stage — from launch to multi-location expansion.',
    whyAdd: 'Growth requires more than products. Clinics that build structured operational and marketing systems scale faster, retain patients better, and expand with less risk.',
    matrixSupport: 'Matrix provides marketing support, funding guidance, operational systems, provider enablement, and strategic account management for clinics ready to grow.',
    icon: 'TrendingUp',
    categories: ['Marketing Support', 'Funding Guidance', 'Operations', 'Multi-Location'],
  },
]
