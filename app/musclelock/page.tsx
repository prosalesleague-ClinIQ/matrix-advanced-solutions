import type { Metadata } from 'next'
import { MuscleLockContent } from './content'

export const metadata: Metadata = {
  title: 'MuscleLock',
  description:
    'MuscleLock by Matrix — premium muscle preservation and performance recovery support for advanced clinical protocols. For qualified providers only.',
}

export default function MuscleLockPage() {
  return <MuscleLockContent />
}
