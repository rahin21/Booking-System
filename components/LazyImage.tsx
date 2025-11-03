'use client'

import React, { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  onClick?: () => void
}

export default function LazyImage({ src, alt, className = '', onClick }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    // Flag immediate error state if src is invalid
    if (!src || typeof src !== 'string' || src.trim() === '') {
      setErrored(true)
    } else {
      // Reset state when src changes to a valid string
      setLoaded(false)
      setErrored(false)
    }
  }, [src])

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {errored && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ImageIcon className="h-6 w-6 text-gray-400" />
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ErroredPlaceholder(errored, src)}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  )
}

function ErroredPlaceholder(errored: boolean, src: string) {
  if (!errored) return src
  // Return a minimal 1x1 transparent gif as fallback to keep layout
  return 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
}