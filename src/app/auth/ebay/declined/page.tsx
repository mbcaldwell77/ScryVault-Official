"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export default function EbayDeclinedPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect back to settings after a short delay
    const timer = setTimeout(() => {
      router.push('/settings')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Authorization Declined</h2>
        <p className="text-gray-300 mb-4">
          You declined to connect your eBay account to ScryVault. You can still use the platform for inventory management, but eBay listing features will not be available.
        </p>
        <p className="text-sm text-gray-400 mb-6">Redirecting you back to settings...</p>
        <button
          onClick={() => router.push('/settings')}
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
        >
          Go to Settings Now
        </button>
      </div>
    </div>
  )
}
