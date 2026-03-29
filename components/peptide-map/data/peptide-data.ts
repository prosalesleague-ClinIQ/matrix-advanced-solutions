// ─── Types ──────────────────────────────────────────────────────────────────

export type SystemId =
  | "neurological"
  | "metabolism"
  | "muscle_recovery"
  | "hormonal"
  | "cellular_repair"
  | "immune"
  | "cardiovascular"
  | "skin_hair"
  | "mitochondrial"
  | "libido_neurohormonal";

export interface Peptide {
  name: string;
  systems: SystemId[];
  description: string;
  mechanism: string;
  category: string;
}

export interface BodySystem {
  id: SystemId;
  name: string;
  region: string;
  description: string;
  color: string;
  targets: string[];
  peptides: string[];
  mechanisms: string[];
  outcomes: string[];
}

// ─── Peptide Definitions ────────────────────────────────────────────────────

export const PEPTIDES: Peptide[] = [
  {
    name: "Semax",
    systems: ["neurological"],
    description: "Synthetic analog of ACTH(4-10) that enhances cognitive function and neuroprotection.",
    mechanism: "Increases BDNF expression and modulates dopamine/serotonin neurotransmission.",
    category: "Nootropic",
  },
  {
    name: "Selank",
    systems: ["neurological"],
    description: "Anxiolytic peptide derived from tuftsin, supporting stress resilience and focus.",
    mechanism: "Modulates GABA-ergic signaling and enhances IL-6 expression for immune-neuro balance.",
    category: "Nootropic",
  },
  {
    name: "Epitalon",
    systems: ["neurological", "cellular_repair", "skin_hair"],
    description: "Tetrapeptide that activates telomerase for cellular longevity.",
    mechanism: "Stimulates telomerase reverse transcriptase, extending telomere length in dividing cells.",
    category: "Longevity",
  },
  {
    name: "MOTS-c",
    systems: ["neurological", "mitochondrial"],
    description: "Mitochondria-derived peptide regulating metabolic homeostasis and cellular energy.",
    mechanism: "Activates AMPK pathway, enhances mitochondrial biogenesis and glucose metabolism.",
    category: "Mitochondrial",
  },
  {
    name: "Retatrutide",
    systems: ["metabolism"],
    description: "Triple-agonist targeting GLP-1, GIP, and glucagon receptors for metabolic optimization.",
    mechanism: "Simultaneous activation of incretin and glucagon pathways for enhanced lipolysis and satiety.",
    category: "GLP-1 Agonist",
  },
  {
    name: "Tirzepatide",
    systems: ["metabolism"],
    description: "Dual GIP/GLP-1 receptor agonist for glycemic control and weight management.",
    mechanism: "GLP-1 receptor activation combined with GIP signaling for superior insulin sensitivity.",
    category: "GLP-1 Agonist",
  },
  {
    name: "Semaglutide",
    systems: ["metabolism"],
    description: "GLP-1 receptor agonist with proven efficacy in metabolic regulation.",
    mechanism: "Sustained GLP-1 receptor activation increasing insulin secretion and reducing glucagon.",
    category: "GLP-1 Agonist",
  },
  {
    name: "AOD-9604",
    systems: ["metabolism"],
    description: "Modified fragment of human growth hormone targeting fat metabolism.",
    mechanism: "Stimulates lipolysis and inhibits lipogenesis without affecting blood sugar or growth.",
    category: "Metabolic",
  },
  {
    name: "BPC-157",
    systems: ["muscle_recovery", "immune", "cardiovascular"],
    description: "Gastric pentadecapeptide supporting accelerated tissue repair across multiple systems.",
    mechanism: "Promotes angiogenesis, fibroblast migration, and modulates nitric oxide pathways.",
    category: "Regenerative",
  },
  {
    name: "TB-500",
    systems: ["muscle_recovery", "immune"],
    description: "Thymosin beta-4 fragment promoting tissue repair and reducing inflammation.",
    mechanism: "Upregulates actin polymerization, promotes cell migration, and reduces pro-inflammatory cytokines.",
    category: "Regenerative",
  },
  {
    name: "Ipamorelin",
    systems: ["hormonal"],
    description: "Selective growth hormone secretagogue with minimal side-effect profile.",
    mechanism: "Stimulates pituitary GH release via ghrelin receptor without elevating cortisol or prolactin.",
    category: "GH Secretagogue",
  },
  {
    name: "CJC-1295",
    systems: ["hormonal"],
    description: "Growth hormone releasing hormone analog for sustained GH elevation.",
    mechanism: "Binds GHRH receptors on pituitary somatotrophs, producing pulsatile GH release over 6–8 days.",
    category: "GH Secretagogue",
  },
  {
    name: "Tesamorelin",
    systems: ["hormonal"],
    description: "GHRH analog reducing visceral adiposity through targeted GH stimulation.",
    mechanism: "Activates pituitary GHRH receptors, increasing endogenous GH and IGF-1 production.",
    category: "GH Secretagogue",
  },
  {
    name: "GHK-Cu",
    systems: ["cellular_repair", "cardiovascular", "skin_hair"],
    description: "Copper tripeptide with broad regenerative and anti-aging properties.",
    mechanism: "Stimulates collagen synthesis, dermal fibroblasts, and VEGF for vascular repair.",
    category: "Regenerative",
  },
  {
    name: "NAD+",
    systems: ["mitochondrial"],
    description: "Essential coenzyme driving cellular energy metabolism and DNA repair.",
    mechanism: "Fuels mitochondrial electron transport chain and activates sirtuin deacetylases.",
    category: "Mitochondrial",
  },
  {
    name: "PT-141",
    systems: ["libido_neurohormonal"],
    description: "Melanocortin receptor agonist for sexual function enhancement.",
    mechanism: "Activates MC3/MC4 receptors in the hypothalamus, initiating dopaminergic reward pathways.",
    category: "Neurohormonal",
  },
  {
    name: "Oxytocin",
    systems: ["libido_neurohormonal"],
    description: "Neuropeptide modulating social bonding, stress response, and sexual function.",
    mechanism: "Binds oxytocin receptors in the hypothalamus, modulating dopamine and serotonin signaling.",
    category: "Neurohormonal",
  },
];

// ─── Body System Definitions ────────────────────────────────────────────────

export const BODY_SYSTEMS: BodySystem[] = [
  {
    id: "neurological",
    name: "Neurological",
    region: "Brain & Central Nervous System",
    description: "Cognitive enhancement, neuroprotection, and stress resilience through targeted peptide signaling.",
    color: "#4ad6ff",
    targets: ["Memory & focus", "Stress resilience", "Neuroplasticity", "BDNF signaling"],
    peptides: ["Semax", "Selank", "Epitalon", "MOTS-c"],
    mechanisms: ["Increase BDNF expression", "Improve neurotransmitter signaling", "Enhance mitochondrial efficiency"],
    outcomes: ["Improved cognitive clarity", "Reduced brain fog", "Enhanced stress adaptation"],
  },
  {
    id: "metabolism",
    name: "Metabolism",
    region: "Gut & Endocrine Axis",
    description: "Fat metabolism, insulin sensitivity, and energy regulation through GLP-1 receptor pathways.",
    color: "#ff8a3d",
    targets: ["Fat metabolism", "Insulin sensitivity", "Energy regulation", "Appetite control"],
    peptides: ["Retatrutide", "Tirzepatide", "Semaglutide", "AOD-9604"],
    mechanisms: ["GLP-1 receptor activation", "Glucagon signaling", "Increase lipolysis"],
    outcomes: ["Optimized body composition", "Stable blood glucose", "Sustained energy levels"],
  },
  {
    id: "muscle_recovery",
    name: "Muscle & Recovery",
    region: "Musculoskeletal System",
    description: "Accelerated tissue repair, collagen formation, and muscle recovery through regenerative pathways.",
    color: "#4aff9f",
    targets: ["Tissue repair", "Collagen formation", "Muscle recovery", "Joint health"],
    peptides: ["BPC-157", "TB-500"],
    mechanisms: ["Angiogenesis activation", "Fibroblast migration", "Collagen synthesis"],
    outcomes: ["Faster recovery times", "Reduced inflammation", "Improved structural integrity"],
  },
  {
    id: "hormonal",
    name: "Hormonal",
    region: "Pituitary & Endocrine System",
    description: "Growth hormone optimization and IGF-1 signaling for anti-aging and body composition.",
    color: "#7b5cff",
    targets: ["Growth hormone", "IGF-1 signaling", "Pituitary function", "Visceral fat reduction"],
    peptides: ["Ipamorelin", "CJC-1295", "Tesamorelin"],
    mechanisms: ["Stimulate pituitary GH release", "Increase IGF-1 production", "Pulsatile GH secretion"],
    outcomes: ["Elevated growth hormone", "Improved body composition", "Enhanced recovery"],
  },
  {
    id: "cellular_repair",
    name: "Cellular Repair",
    region: "DNA & Telomere Systems",
    description: "DNA repair, telomere stabilization, and cellular longevity through epigenetic pathways.",
    color: "#ffd44a",
    targets: ["DNA repair", "Telomere stability", "Cellular senescence", "Tissue regeneration"],
    peptides: ["Epitalon", "GHK-Cu"],
    mechanisms: ["Increase telomerase activity", "Stimulate tissue regeneration", "Collagen remodeling"],
    outcomes: ["Slowed cellular aging", "Enhanced tissue renewal", "Improved cell function"],
  },
  {
    id: "immune",
    name: "Immune",
    region: "Thymus & Lymphatic System",
    description: "Immune modulation and inflammation reduction for systemic balance.",
    color: "#a0f0ff",
    targets: ["Immune modulation", "Inflammation reduction", "Cytokine balance", "Tissue repair"],
    peptides: ["TB-500", "BPC-157"],
    mechanisms: ["Reduce pro-inflammatory cytokines", "Improve tissue repair", "Modulate immune response"],
    outcomes: ["Reduced chronic inflammation", "Balanced immune function", "Faster healing"],
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular",
    region: "Heart & Vascular System",
    description: "Vascular repair, circulation enhancement, and endothelial function restoration.",
    color: "#ff4a6a",
    targets: ["Vascular repair", "Circulation", "Endothelial health", "VEGF signaling"],
    peptides: ["BPC-157", "GHK-Cu"],
    mechanisms: ["VEGF signaling activation", "Endothelial repair", "Nitric oxide modulation"],
    outcomes: ["Improved blood flow", "Enhanced vascular integrity", "Faster wound healing"],
  },
  {
    id: "skin_hair",
    name: "Skin & Hair",
    region: "Dermal & Follicular Systems",
    description: "Collagen production, skin regeneration, and follicular health through growth factor activation.",
    color: "#ff8ad6",
    targets: ["Collagen production", "Skin regeneration", "Hair follicle health", "Dermal elasticity"],
    peptides: ["GHK-Cu", "Epitalon"],
    mechanisms: ["Stimulate dermal fibroblasts", "Increase collagen synthesis", "Activate growth factors"],
    outcomes: ["Improved skin texture", "Reduced fine lines", "Healthier hair growth"],
  },
  {
    id: "mitochondrial",
    name: "Mitochondrial",
    region: "Cellular Energy Systems",
    description: "ATP production, cellular metabolism, and mitochondrial biogenesis for energy optimization.",
    color: "#ffb84a",
    targets: ["ATP production", "Cellular metabolism", "Mitochondrial biogenesis", "Oxidative balance"],
    peptides: ["MOTS-c", "NAD+"],
    mechanisms: ["Mitochondrial biogenesis", "Energy metabolism activation", "AMPK pathway signaling"],
    outcomes: ["Increased cellular energy", "Improved metabolic efficiency", "Enhanced endurance"],
  },
  {
    id: "libido_neurohormonal",
    name: "Libido & Neurohormonal",
    region: "Hypothalamus & Reward Pathways",
    description: "Sexual signaling, dopamine pathway activation, and neurohormonal balance.",
    color: "#d44cff",
    targets: ["Sexual signaling", "Dopamine pathways", "Neurohormonal balance", "Reward system"],
    peptides: ["PT-141", "Oxytocin"],
    mechanisms: ["Melanocortin receptor activation", "Dopamine signaling modulation", "Oxytocin pathway activation"],
    outcomes: ["Enhanced sexual function", "Improved mood", "Strengthened bonding response"],
  },
];

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

export const SYSTEM_MAP = new Map<SystemId, BodySystem>(
  BODY_SYSTEMS.map((s) => [s.id, s])
);

export function getPeptidesBySystem(id: SystemId): Peptide[] {
  return PEPTIDES.filter((p) => p.systems.includes(id));
}

export function getSystemsForPeptide(name: string): BodySystem[] {
  const peptide = PEPTIDES.find((p) => p.name === name);
  if (!peptide) return [];
  return peptide.systems
    .map((id) => SYSTEM_MAP.get(id))
    .filter((s): s is BodySystem => s !== undefined);
}
