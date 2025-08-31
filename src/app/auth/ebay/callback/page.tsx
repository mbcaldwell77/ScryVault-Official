"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ebayAPI } from '@/lib/ebay'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function EbayCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 eBay OAuth callback triggered')
      console.log('URL:', window.location.href)
      console.log('Search params:', Object.fromEntries(searchParams.entries()))

      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        console.log('Authorization code:', code)
        console.log('Error:', error)
        console.log('State:', state)

        if (error) {
          setStatus('error')
          setMessage(`Authentication failed: ${error}`)
          console.error('OAuth error:', error)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          console.error('No authorization code in callback')
          return
        }

        console.log('🔄 Exchanging authorization code for tokens...')
        // Exchange the authorization code for tokens
        await ebayAPI.exchangeCodeForTokens(code)

        setStatus('success')
        setMessage('Successfully connected to eBay!')

        // Redirect back to the page that initiated the auth (or dashboard)
        setTimeout(() => {
          const returnUrl = state || '/dashboard'
          router.push(returnUrl)
        }, 2000)

      } catch (error) {
        console.error('eBay OAuth callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Failed to complete authentication')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-4">Connecting to eBay</h2>
            <p className="text-gray-300">Please wait while we complete the authentication...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Success!</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-400">Redirecting you back...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Failed</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <button
              onClick={() => router.push('/settings')}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Go to Settings
            </button>
          </>
        )}
      </div>
    </div>
  )
}
