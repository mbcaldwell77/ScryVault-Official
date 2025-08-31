"use client"

import { useAuth } from '@/lib/auth-context'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      localStorage.removeItem('scryvault_demo_mode')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isDemoMode = localStorage.getItem('scryvault_demo_mode') === 'true'

  return (
    <header className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-white">
            ScryVault
          </Link>
          {isDemoMode && (
            <span className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
              Demo Mode
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </>
          ) : isDemoMode ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200"
              >
                Create Account
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Exit Demo</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
