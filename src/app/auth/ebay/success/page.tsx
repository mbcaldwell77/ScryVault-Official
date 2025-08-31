"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function EbaySuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect back to settings after a short delay
    const timer = setTimeout(() => {
      router.push('/settings')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Authorization Successful!</h2>
        <p className="text-gray-300 mb-4">
          Your eBay account has been successfully connected to ScryVault. You can now create and manage eBay listings directly from the platform.
        </p>
        <p className="text-sm text-gray-400">Redirecting you back to settings...</p>
      </div>
    </div>
  )
}
