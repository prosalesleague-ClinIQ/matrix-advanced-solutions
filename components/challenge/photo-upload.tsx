'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface PhotoUploadProps {
  label: string
  participantId: string
  weekNumber: number
  position: 'front' | 'side' | 'back'
  currentUrl?: string
  onUpload: (url: string) => void
}

export function PhotoUpload({
  label,
  participantId,
  weekNumber,
  position,
  currentUrl,
  onUpload,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please upload a JPEG, PNG, or WebP image.')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('File must be under 10 MB.')
        return
      }

      // Show local preview immediately
      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)
      setUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('participantId', participantId)
        formData.append('weekNumber', String(weekNumber))
        formData.append('position', position)

        const res = await fetch('/api/challenge/photos', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? 'Upload failed')
        }

        const { url } = (await res.json()) as { url: string }
        setPreview(url)
        onUpload(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        setPreview(currentUrl ?? null)
      } finally {
        setUploading(false)
      }
    },
    [participantId, weekNumber, position, currentUrl, onUpload]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const clearPhoto = () => {
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-steel-300">{label} Photo</p>

      {preview ? (
        <div className="relative overflow-hidden rounded-xl">
          <Image
            src={preview}
            alt={`${label} progress photo`}
            width={300}
            height={400}
            className="h-48 w-full rounded-xl object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-navy-950/70">
              <Loader2 className="h-6 w-6 animate-spin text-accent-cyan" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute right-2 top-2 rounded-full bg-navy-950/80 p-1.5 text-steel-400 transition-colors hover:text-white"
              aria-label={`Remove ${label} photo`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors',
            dragActive
              ? 'border-accent-cyan/60 bg-accent-cyan/5'
              : 'border-white/20 bg-white/5 hover:border-accent-cyan/40 hover:bg-white/8'
          )}
        >
          <Camera className="h-8 w-8 text-steel-500" />
          <span className="text-sm text-steel-400">Upload {label} Photo</span>
          <span className="text-xs text-steel-500">
            JPEG, PNG, or WebP &middot; Max 10 MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        aria-label={`Upload ${label} photo`}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
