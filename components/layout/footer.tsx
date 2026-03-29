import Link from 'next/link'
import { footerNav } from '@/data/navigation'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Solutions</h3>
            <ul className="space-y-2.5">
              {footerNav.solutions.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-steel-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerNav.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-steel-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {footerNav.resources.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-steel-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {footerNav.legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-steel-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-sm font-semibold text-white">Matrix Advanced Solutions</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-steel-500">
              <p>&copy; {new Date().getFullYear()} Matrix Advanced Solutions. All rights reserved.</p>
              <span className="hidden sm:inline">·</span>
              <p className="text-steel-600">Professional Use Only. For qualified clinics and providers.</p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-steel-600 max-w-3xl leading-relaxed">
            Products and services are intended for qualified, credentialed healthcare providers and licensed clinics only.
            All products are subject to credentialing, approval, and jurisdictional regulatory review.
            Nothing on this website constitutes medical advice. Information is intended for professional audiences.
          </p>
        </div>
      </div>
    </footer>
  )
}
