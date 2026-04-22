import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'SMS Terms & Conditions',
  description: 'SMS / Text Message Program Terms for Matrix Advanced Solutions LLC. Opt-in, opt-out, message frequency, fees, and privacy for our text messaging program.',
}

export default function SmsTermsPage() {
  return (
    <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
      <Container size="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">Legal</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">SMS Terms &amp; Conditions</h1>
        <p className="text-sm text-steel-500 mb-10">Last Updated: December 4, 2025</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-steel-400">

          <section>
            <h2 className="text-lg font-semibold text-white">Program Name</h2>
            <p className="font-medium text-white">&ldquo;Matrix Advanced Solutions LLC SMS Alerts&rdquo;</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Program Description</h2>
            <p>By opting in, you agree to receive text messages from Matrix Advanced Solutions LLC related to account notifications, service updates, appointment reminders, customer support communications, and marketing or promotional messages (only if separately consented).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Sample Messages</h2>
            <p className="font-medium text-white mt-4">Service / Transactional:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>&ldquo;Matrix Advanced Solutions: Your catalog is ready at matrixadvancedsolutions.com/catalog. Reply STOP to opt out, HELP for help.&rdquo;</li>
              <li>&ldquo;Matrix Advanced Solutions: Your onboarding call is tomorrow at 2pm ET. Reply STOP to opt out.&rdquo;</li>
            </ul>
            <p className="font-medium text-white mt-4">Marketing (only if separately opted in):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>&ldquo;Matrix Advanced Solutions: New peptide protocols available for Q2. View at matrixadvancedsolutions.com. Reply STOP to opt out.&rdquo;</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Opt-In</h2>
            <p>You opt in by submitting your phone number through our website forms and selecting the applicable consent checkbox(es). Consent is not a condition of purchase.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Opt-Out</h2>
            <p>You may cancel the SMS service at any time by texting <strong className="text-white">STOP</strong> or <strong className="text-white">OUT</strong> to <strong className="text-white">831-298-8933</strong>. After sending STOP, you will receive confirmation and no further messages will be sent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Help</h2>
            <p>Reply <strong className="text-white">HELP</strong> for assistance or contact: <a href="mailto:leo@matrixadvancedsolutions.com" className="text-accent-purple hover:text-accent-purple-light transition-colors">leo@matrixadvancedsolutions.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Message Frequency</h2>
            <p>Message frequency varies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Fees</h2>
            <p>Message and data rates may apply for messages sent to you and from you.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Carrier Disclaimer</h2>
            <p>Carriers are not liable for delayed or undelivered messages.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Rejoin</h2>
            <p>To rejoin, you must complete the opt-in process again through our website.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Age Requirement</h2>
            <p>You must be at least <strong className="text-white">18 years of age</strong> to participate in our SMS messaging program. By opting in, you confirm that you are at least 18 years old or have obtained parental consent as required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Privacy</h2>
            <p>Text messaging originator opt-in data and consent are not shared with any third parties, except for aggregators and providers of the text message services. No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. See our <Link href="/privacy" className="text-accent-purple hover:text-accent-purple-light transition-colors">Privacy Policy</Link> for full details.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p>
              <strong className="text-white">Matrix Advanced Solutions LLC</strong><br />
              5830 E 2nd Street, STE 7000 9914<br />
              Casper, WY 82609<br />
              United States
            </p>
            <p>Phone: <a href="tel:+18312988933" className="text-accent-purple hover:text-accent-purple-light transition-colors">831-298-8933</a></p>
            <p>Email: <a href="mailto:leo@matrixadvancedsolutions.com" className="text-accent-purple hover:text-accent-purple-light transition-colors">leo@matrixadvancedsolutions.com</a></p>
          </section>

          <section className="pt-4">
            <p className="text-xs text-steel-500">See also: <Link href="/terms" className="text-accent-purple hover:text-accent-purple-light transition-colors">Terms of Service</Link> &middot; <Link href="/privacy" className="text-accent-purple hover:text-accent-purple-light transition-colors">Privacy Policy</Link></p>
          </section>

        </div>
      </Container>
    </section>
  )
}
