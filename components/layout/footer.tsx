import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <Image
            src="/images/matrix-logo-horizontal-sm.webp"
            alt="Matrix Advanced Solutions"
            width={180}
            height={40}
            className="h-8 w-auto"
          />

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/terms" className="text-steel-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-steel-700">|</span>
            <Link href="/privacy" className="text-steel-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-steel-700">|</span>
            <Link href="/sms-terms" className="text-steel-400 hover:text-white transition-colors">
              SMS Terms
            </Link>
            <span className="text-steel-700">|</span>
            <Link href="/contact" className="text-steel-400 hover:text-white transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Business identity — required for SMS/A2P compliance and commercial trust */}
          <address className="not-italic text-center text-xs text-steel-500 leading-relaxed">
            <span className="text-steel-300 font-medium">Matrix Advanced Solutions LLC</span><br />
            5830 E 2nd Street, STE 7000 9914, Casper, WY 82609, United States<br />
            <a href="tel:+18312988933" className="hover:text-white transition-colors">831-298-8933</a>
            <span className="text-steel-700 mx-2">|</span>
            <a href="mailto:leo@matrixadvancedsolutions.com" className="hover:text-white transition-colors">leo@matrixadvancedsolutions.com</a>
          </address>

          {/* Disclaimer + copyright */}
          <div className="text-center space-y-1">
            <p className="text-xs text-steel-500">
              Professional Use Only. For qualified clinics and providers. Not medical advice.
            </p>
            <p className="text-xs text-steel-600">
              &copy; {new Date().getFullYear()} Matrix Advanced Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
