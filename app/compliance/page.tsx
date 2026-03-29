import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'Compliance & Disclaimer',
  description: 'Compliance information, regulatory disclaimers, and professional use guidelines for Matrix Advanced Solutions.',
}

export default function CompliancePage() {
  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container size="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-8">Compliance & Disclaimer</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-steel-400">
          <section>
            <h2 className="text-lg font-semibold text-white">Professional Use Only</h2>
            <p>All products, services, and information provided by Matrix Advanced Solutions are intended exclusively for qualified, credentialed healthcare providers and licensed clinics. Nothing on this website is intended for consumer purchase, self-administration, or direct-to-patient sale without appropriate medical supervision.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Not Medical Advice</h2>
            <p>The information on this website does not constitute medical advice, diagnosis, or treatment recommendations. All content is intended for educational and informational purposes for professional audiences only. Healthcare providers should exercise independent clinical judgment in all treatment decisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Credentialing & Approval</h2>
            <p>Access to Matrix products and services is subject to credentialing verification, licensing review, and approval. Not all products are available in all jurisdictions. Product and category availability is subject to regulatory review and may change without notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Regulatory Compliance</h2>
            <p>Matrix Advanced Solutions maintains compliance-forward operations and expects all partner clinics and providers to operate within applicable federal, state, and local regulations. Products described on this website may be subject to specific regulatory requirements in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Product Information</h2>
            <p>Product descriptions, categories, and specifications are provided for informational purposes and are subject to change. Matrix does not guarantee the accuracy or completeness of product information displayed on this website. Clinics should verify product details and compliance requirements with their account team.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Limitation of Liability</h2>
            <p>Matrix Advanced Solutions provides products and support services to qualified clinics. Matrix is not responsible for clinical outcomes, treatment decisions, or patient care provided by partner clinics. All clinical decisions remain the responsibility of the treating healthcare provider.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p>For compliance questions, credentialing inquiries, or regulatory concerns, please contact our team through the <a href="/contact" className="text-accent-purple hover:text-accent-purple-light transition-colors">Contact page</a>.</p>
          </section>
        </div>
      </Container>
    </section>
  )
}
