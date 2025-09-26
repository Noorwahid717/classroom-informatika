'use client'

import { useEffect, useRef } from 'react'

interface PreviewFrameProps {
  documentString: string
  title?: string
}

export function PreviewFrame({ documentString, title }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    iframe.srcdoc = documentString

    return () => {
      iframe.srcdoc = '<!doctype html><html><body></body></html>'
    }
  }, [documentString])

  return (
    <iframe
      ref={iframeRef}
      title={title ?? 'Pratinjau portfolio siswa'}
      sandbox="allow-scripts"
      className="w-full h-full rounded-lg border border-gray-200 bg-white"
      aria-live="polite"
    />
  )
}
