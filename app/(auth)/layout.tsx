import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <Image
              src="/images/matrix-logo-horizontal-sm.webp"
              alt="Matrix Advanced Solutions"
              width={200}
              height={45}
              className="h-10 w-auto mx-auto"
              priority
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
