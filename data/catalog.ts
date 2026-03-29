export type ProductCategory = {
  id: string
  name: string
  description: string
  productCount: number
}

export type Product = {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  format: string
  forProfessionalUseOnly: boolean
  requiresCredentialing: boolean
  tags: string[]
}

export const productCategories: ProductCategory[] = [
  { id: 'metabolic', name: 'Metabolic', description: 'GLP-1 receptor agonists and metabolic health support products.', productCount: 12 },
  { id: 'peptides', name: 'Peptides', description: 'Advanced therapeutic and optimization peptides for clinical protocols.', productCount: 24 },
  { id: 'regenerative', name: 'Regenerative', description: 'Regenerative medicine products including growth factors and tissue support.', productCount: 8 },
  { id: 'exosomes', name: 'Exosomes', description: 'Premium exosome products for regenerative clinical applications.', productCount: 6 },
  { id: 'sexual-health', name: 'Sexual Health', description: 'Sexual wellness and performance optimization products.', productCount: 10 },
  { id: 'longevity', name: 'Longevity', description: 'NAD+ and longevity-focused clinical products.', productCount: 8 },
  { id: 'performance', name: 'Performance / Recovery', description: 'Recovery protocols and performance optimization support.', productCount: 14 },
  { id: 'bundles', name: 'Bundles / Protocol Support', description: 'Curated protocol bundles for structured clinical programs.', productCount: 6 },
]

export const products: Product[] = [
  { id: 'semaglutide-injection', name: 'Semaglutide', category: 'metabolic', subcategory: 'GLP-1', description: 'GLP-1 receptor agonist for qualified metabolic health protocols. Subject to provider credentialing.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['weight-management', 'metabolic', 'glp-1'] },
  { id: 'tirzepatide-injection', name: 'Tirzepatide', category: 'metabolic', subcategory: 'GLP-1/GIP', description: 'Dual GLP-1/GIP receptor agonist for advanced metabolic protocols. Subject to credentialing and approval.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['weight-management', 'metabolic', 'dual-agonist'] },
  { id: 'bpc-157', name: 'BPC-157', category: 'peptides', subcategory: 'Recovery', description: 'Body Protection Compound peptide for clinical recovery and tissue support protocols.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['recovery', 'tissue-support', 'peptide'] },
  { id: 'cjc-ipamorelin', name: 'CJC-1295 / Ipamorelin', category: 'peptides', subcategory: 'Growth Hormone', description: 'Growth hormone releasing peptide combination for optimization protocols.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['growth-hormone', 'optimization', 'peptide'] },
  { id: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', category: 'peptides', subcategory: 'Immune', description: 'Immune modulation peptide for qualified clinical applications.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['immune', 'peptide'] },
  { id: 'pt-141', name: 'PT-141 (Bremelanotide)', category: 'sexual-health', subcategory: 'Sexual Health', description: 'Melanocortin receptor agonist for sexual health clinical protocols.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['sexual-health', 'peptide'] },
  { id: 'nad-plus', name: 'NAD+', category: 'longevity', subcategory: 'Longevity', description: 'Nicotinamide adenine dinucleotide for longevity and cellular health protocols.', format: 'Injectable / IV', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['longevity', 'cellular-health', 'nad'] },
  { id: 'exosome-regen', name: 'Regenerative Exosomes', category: 'exosomes', subcategory: 'Regenerative', description: 'Premium exosome preparation for qualified regenerative medicine applications.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['regenerative', 'exosome'] },
  { id: 'aod-9604', name: 'AOD-9604', category: 'peptides', subcategory: 'Metabolic', description: 'Modified growth hormone fragment for metabolic support protocols.', format: 'Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['metabolic', 'peptide'] },
  { id: 'oxytocin', name: 'Oxytocin', category: 'sexual-health', subcategory: 'Wellness', description: 'Oxytocin for qualified clinical wellness and health protocols.', format: 'Nasal / Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['wellness', 'sexual-health'] },
  { id: 'ghk-cu', name: 'GHK-Cu', category: 'regenerative', subcategory: 'Tissue', description: 'Copper peptide for tissue remodeling and regenerative applications.', format: 'Topical / Injectable', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['regenerative', 'tissue', 'peptide'] },
  { id: 'metabolic-bundle', name: 'Metabolic Program Bundle', category: 'bundles', subcategory: 'Protocol', description: 'Curated product bundle for clinics launching structured metabolic health programs.', format: 'Multi-product', forProfessionalUseOnly: true, requiresCredentialing: true, tags: ['bundle', 'metabolic', 'protocol'] },
]
