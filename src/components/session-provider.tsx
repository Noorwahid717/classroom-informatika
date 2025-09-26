'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

export function AppSessionProvider({ children }: SessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}
