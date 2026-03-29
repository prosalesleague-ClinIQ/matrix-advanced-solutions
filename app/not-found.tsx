import Link from 'next/link'
import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <section className="min-h-[80vh] flex items-center pt-20">
      <Container className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-purple mb-4">
          404
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Page Not Found
        </h1>
        <p className="text-base text-steel-400 max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="secondary" size="lg">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      </Container>
    </section>
  )
}
