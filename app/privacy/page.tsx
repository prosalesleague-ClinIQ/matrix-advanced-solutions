import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Matrix Advanced Solutions. How we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container size="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-blue mb-4">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-steel-400">
          <section>
            <h2 className="text-lg font-semibold text-white">Information We Collect</h2>
            <p>When you submit forms on this website, we collect the information you provide, including clinic name, contact name, email address, phone number, role, and other details relevant to your inquiry. We also collect technical data such as page visited, referral source, and UTM parameters for analytics and attribution purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">How We Use Your Information</h2>
            <p>Information submitted through our website is used to process your inquiry, evaluate partnership eligibility, provide account support, and communicate relevant service updates. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Data Sharing</h2>
            <p>We may share your information with service providers who assist in operating our website, processing inquiries, and supporting clinic partnerships. These providers are bound by confidentiality obligations. We may also share information as required by law or to protect our rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cookies & Analytics</h2>
            <p>This website may use cookies and analytics tools to improve user experience and measure website performance. These tools may collect anonymous usage data. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Data Security</h2>
            <p>We implement reasonable technical and organizational measures to protect the information you provide. However, no method of electronic transmission or storage is completely secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information by contacting us through our <a href="/contact" className="text-accent-blue hover:text-accent-cyan transition-colors">Contact page</a>. We will respond to your request within a reasonable timeframe.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Material changes will be reflected on this page with an updated effective date.</p>
          </section>

          <p className="text-xs text-steel-600 mt-8">Last updated: March 2026</p>
        </div>
      </Container>
    </section>
  )
}
