"use client"

import { useAuth } from '@/lib/auth-context'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-gray-800/50 border-b border-gray-700/50 px-4 lg:px-6 py-4 lg:ml-64">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Link href="/" className="text-lg lg:text-xl font-bold text-white">
            ScryVault
          </Link>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center space-x-2 text-gray-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 lg:space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-2 lg:px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-3 lg:px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 text-sm"
              >
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
