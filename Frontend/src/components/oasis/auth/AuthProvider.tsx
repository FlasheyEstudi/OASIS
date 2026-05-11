'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { DropLoader } from '@/components/oasis/shared/shared-components'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <DropLoader size={48} />
      </div>
    )
  }

  return <>{children}</>
}
