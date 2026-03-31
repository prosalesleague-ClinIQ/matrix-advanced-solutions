import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Matrix Advanced Solutions LLC. How we collect, use, disclose, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container size="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-sm text-steel-500 mb-10">Last Updated: December 4, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-steel-400">

          <p>Matrix Advanced Solutions LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates this website and all related services (the &ldquo;Services&rdquo;). This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you interact with our Services.</p>
          <p>By using our Services, you agree to the terms of this Privacy Policy.</p>

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-white">1. Personal Information We Collect</h2>
            <p>We may collect the following categories of personal information:</p>

            <h3 className="text-base font-semibold text-white mt-4">Contact Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name</li>
              <li>Billing address</li>
              <li>Shipping address</li>
              <li>Email address</li>
              <li>Phone number</li>
            </ul>

            <h3 className="text-base font-semibold text-white mt-4">Financial Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment card details</li>
              <li>Billing information</li>
              <li>Transaction records</li>
            </ul>

            <h3 className="text-base font-semibold text-white mt-4">Account Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Username</li>
              <li>Password</li>
              <li>Account preferences</li>
            </ul>

            <h3 className="text-base font-semibold text-white mt-4">Transaction Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Purchase history</li>
              <li>Order details</li>
              <li>Returns and exchanges</li>
            </ul>

            <h3 className="text-base font-semibold text-white mt-4">Communications</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Messages sent to us</li>
              <li>Customer support inquiries</li>
            </ul>

            <h3 className="text-base font-semibold text-white mt-4">Device &amp; Usage Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device identifiers</li>
              <li>Website interaction data</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-white">2. Tax Identifier Collection</h2>
            <p>Where required for regulatory, compliance, or financial purposes, we may collect tax identification information, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Employer Identification Number (EIN)</li>
              <li>Social Security Number (SSN)</li>
              <li>Individual Taxpayer Identification Number (ITIN)</li>
              <li>Other government-issued tax identifiers</li>
            </ul>
            <p>This information is collected only when necessary and is securely stored in accordance with applicable laws.</p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-white">3. Cookies &amp; Tracking Technologies</h2>
            <p>We use cookies, pixels, tags, web beacons, and similar tracking technologies to collect and store information about your interactions with our website and Services.</p>

            <h3 className="text-base font-semibold text-white mt-4">What Are Cookies</h3>
            <p>Cookies are small data files placed on your device when you visit a website. They help improve functionality and user experience.</p>

            <h3 className="text-base font-semibold text-white mt-4">Types of Cookies We Use</h3>
            <p><strong className="text-white">Essential Cookies</strong> &mdash; Required for website functionality, security, and accessibility.</p>
            <p><strong className="text-white">Analytics Cookies</strong> &mdash; Help us understand how users interact with our website.</p>
            <p><strong className="text-white">Functional Cookies</strong> &mdash; Remember your preferences and settings.</p>
            <p><strong className="text-white">Advertising Cookies</strong> &mdash; Used to deliver relevant advertising and measure campaign effectiveness.</p>

            <h3 className="text-base font-semibold text-white mt-4">Third-Party Technologies</h3>
            <p>We may use trusted third-party providers for analytics and performance tracking.</p>

            <h3 className="text-base font-semibold text-white mt-4">Mobile &amp; SMS Data Protection</h3>
            <p>Tracking technologies are not used to collect or store text messaging originator opt-in data.</p>
            <p>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.</p>
            <p>Text messaging originator opt-in data and consent will not be shared with any third parties, except for aggregators and providers of the text message services.</p>
            <p>All categories of personal information exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties, excluding aggregators and providers of the text message services.</p>
            <p>Information sharing to subcontractors in support services, such as customer service, is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-white">4. How We Use Personal Information</h2>
            <p>We use personal information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process orders and payments</li>
              <li>Provide products and services</li>
              <li>Deliver customer support</li>
              <li>Send service-related communications</li>
              <li>Send marketing communications (only with explicit consent)</li>
              <li>Detect fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-white">5. How We Share Personal Information</h2>
            <p>We may share personal information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment processors</li>
              <li>Shipping providers</li>
              <li>IT and cloud service providers</li>
              <li>Legal authorities when required</li>
            </ul>
            <p>We do not sell personal information.</p>
            <p>We do not share mobile opt-in data for marketing purposes.</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-white">6. Data Retention</h2>
            <p>We retain personal information only as long as necessary to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Complete transactions</li>
              <li>Maintain records</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-white">7. Security</h2>
            <p>We implement reasonable administrative, technical, and physical safeguards to protect your personal information, including sensitive financial and tax-related data.</p>
            <p>However, no method of transmission over the internet is completely secure.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-white">8. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion</li>
              <li>Opt out of marketing communications</li>
              <li>Request data portability</li>
            </ul>
            <p>To exercise your rights, contact us:</p>
            <p>
              <strong className="text-white">Matrix Advanced Solutions LLC</strong><br />
              Email: <a href="mailto:leo@matrixadvancedsolutions.com" className="text-accent-purple hover:text-accent-purple-light transition-colors">leo@matrixadvancedsolutions.com</a><br />
              Address: 951 De Soto Road, 427, Boca Raton, FL 33432, United States
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-white">9. International Transfers</h2>
            <p>Your information may be transferred and processed outside your country of residence where legally permitted.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-white">10. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy periodically. Updates will be posted on this page with a revised &ldquo;Last Updated&rdquo; date.</p>
          </section>

        </div>
      </Container>
    </section>
  )
}
