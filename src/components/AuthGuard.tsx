"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const isDemoMode = localStorage.getItem('scryvault_demo_mode') === 'true'

      if (requireAuth && !user && !isDemoMode) {
        // Redirect to login if authentication is required and user is not logged in
        router.push('/login')
      }
    }
  }, [user, loading, requireAuth, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is not required, or user is authenticated, or in demo mode
  const isDemoMode = localStorage.getItem('scryvault_demo_mode') === 'true'
  if (!requireAuth || user || isDemoMode) {
    return <>{children}</>
  }

  // This will briefly show while redirecting
  return null
}
