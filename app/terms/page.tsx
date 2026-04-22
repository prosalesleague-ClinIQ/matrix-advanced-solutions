import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Matrix Advanced Solutions LLC.',
}

export default function TermsPage() {
  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container size="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">Terms of Service</h1>
        <p className="text-sm text-steel-500 mb-10">Last Updated: December 4, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-steel-400">

          {/* Overview */}
          <section>
            <h2 className="text-lg font-semibold text-white">Overview</h2>
            <p>Welcome to Matrix Advanced Solutions LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We operate this website and all related services (the &ldquo;Services&rdquo;).</p>
            <p>By accessing or using our Services, you agree to be bound by these Terms of Service and our <a href="/privacy" className="text-accent-purple hover:text-accent-purple-light transition-colors">Privacy Policy</a>.</p>
            <p>If you do not agree, you may not use our Services.</p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 1 &mdash; Eligibility</h2>
            <p>You must be at least the age of majority in your jurisdiction to use our Services.</p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 2 &mdash; Products &amp; Services</h2>
            <p>We make reasonable efforts to ensure that all descriptions of products and services are accurate. However, we do not guarantee that all information is error-free. We reserve the right to modify or discontinue any product or service at any time without notice.</p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 3 &mdash; Orders &amp; Billing</h2>
            <p>We reserve the right to refuse or cancel any order. You agree to provide current, complete, and accurate billing and account information for all purchases.</p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 4 &mdash; Shipping &amp; Delivery</h2>
            <p>Delivery times are estimates only and are not guaranteed. Risk of loss transfers to you upon shipment.</p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 5 &mdash; Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, and images, is the property of Matrix Advanced Solutions LLC or its licensors and is protected by intellectual property laws.</p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 6 &mdash; Third-Party Services</h2>
            <p>Our Services may include integrations with third-party platforms. We are not responsible for third-party services, content, or policies.</p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 7 &mdash; Privacy</h2>
            <p>Your use of our Services is governed by our <a href="/privacy" className="text-accent-purple hover:text-accent-purple-light transition-colors">Privacy Policy</a>.</p>
          </section>

          {/* Section 8 – SMS */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 8 &mdash; SMS / Text Message Program Terms</h2>
            <p className="font-medium text-white">&ldquo;Matrix Advanced Solutions LLC SMS Alerts&rdquo;</p>
            <p>For the standalone version of these SMS terms, see our <a href="/sms-terms" className="text-accent-purple hover:text-accent-purple-light transition-colors">SMS Terms &amp; Conditions</a> page.</p>

            <h3 className="text-base font-semibold text-white mt-6">Program Description</h3>
            <p>By opting in, you agree to receive text messages from Matrix Advanced Solutions LLC related to account notifications, service updates, appointment reminders, customer support communications, and marketing or promotional messages (only if separately consented).</p>

            <h3 className="text-base font-semibold text-white mt-6">Opt-In</h3>
            <p>You opt in by submitting your phone number through our website forms and selecting the applicable consent checkbox(es). Consent is not a condition of purchase.</p>

            <h3 className="text-base font-semibold text-white mt-6">Opt-Out</h3>
            <p>You may cancel the SMS service at any time by texting <strong className="text-white">STOP</strong> or <strong className="text-white">OUT</strong> to <strong className="text-white">831-298-8933</strong>. After sending STOP, you will receive confirmation and no further messages will be sent.</p>

            <h3 className="text-base font-semibold text-white mt-6">Help</h3>
            <p>Reply <strong className="text-white">HELP</strong> for assistance or contact: <a href="mailto:leo@matrixadvancedsolutions.com" className="text-accent-purple hover:text-accent-purple-light transition-colors">leo@matrixadvancedsolutions.com</a></p>

            <h3 className="text-base font-semibold text-white mt-6">Message Frequency</h3>
            <p>Message frequency varies.</p>

            <h3 className="text-base font-semibold text-white mt-6">Fees</h3>
            <p>Message and data rates may apply for messages sent to you and from you.</p>

            <h3 className="text-base font-semibold text-white mt-6">Carrier Disclaimer</h3>
            <p>Carriers are not liable for delayed or undelivered messages.</p>

            <h3 className="text-base font-semibold text-white mt-6">Rejoin</h3>
            <p>To rejoin, you must complete the opt-in process again through our website.</p>

            <h3 className="text-base font-semibold text-white mt-6">Age Requirement</h3>
            <p>You must be at least <strong className="text-white">18 years of age</strong> to participate in our SMS messaging program. By opting in, you confirm that you are at least 18 years old or have obtained parental consent as required by law.</p>

            <h3 className="text-base font-semibold text-white mt-6">Privacy</h3>
            <p>For privacy-related inquiries, please review our <a href="/privacy" className="text-accent-purple hover:text-accent-purple-light transition-colors">Privacy Policy</a>.</p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 9 &mdash; Disclaimer of Warranties</h2>
            <p>All Services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied.</p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 10 &mdash; Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Matrix Advanced Solutions LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Services.</p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 11 &mdash; Indemnification</h2>
            <p>You agree to indemnify and hold harmless Matrix Advanced Solutions LLC from any claims, damages, or liabilities arising from your use of the Services or violation of these Terms.</p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 12 &mdash; Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Florida.</p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 13 &mdash; Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time. Continued use of the Services constitutes acceptance of any changes.</p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-lg font-semibold text-white">Section 14 &mdash; Contact Information</h2>
            <p>
              <strong className="text-white">Matrix Advanced Solutions LLC</strong><br />
              5830 E 2nd Street, STE 7000 9914<br />
              Casper, WY 82609<br />
              United States
            </p>
            <p>Email: <a href="mailto:leo@matrixadvancedsolutions.com" className="text-accent-purple hover:text-accent-purple-light transition-colors">leo@matrixadvancedsolutions.com</a></p>
          </section>

        </div>
      </Container>
    </section>
  )
}
