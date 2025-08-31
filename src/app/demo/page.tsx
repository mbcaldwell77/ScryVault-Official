"use client"

// useEffect not needed in demo page
import { useRouter } from 'next/navigation'
import { Sparkles, BookOpen, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const router = useRouter()

  const handleDemoAccess = () => {
    // For demo mode, we'll use local storage to track demo state
    localStorage.setItem('scryvault_demo_mode', 'true')
    router.push('/scan')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="inline-flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 hover:bg-gray-700/50 transition-colors">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-gray-300">ScryVault</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Demo Mode</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Try ScryVault
              </span>
              <br />
              <span className="text-white">For Free</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the power of AI-powered book scanning and inventory management.
              Add books, track profits, and see how ScryVault transforms your book selling business.
            </p>

            <button
              onClick={handleDemoAccess}
              className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-xl shadow-emerald-500/25 transform hover:scale-105"
            >
              Start Demo
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Scan Books Instantly</h3>
              <p className="text-gray-400 text-sm">
                Use ISBN scanning or manual entry to add books to your inventory with automatic metadata lookup.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Profits</h3>
              <p className="text-gray-400 text-sm">
                Monitor your costs, asking prices, and profit margins with detailed analytics and reporting.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">
                Leverage Google Books API for instant book data, automatic pricing suggestions, and smart insights.
              </p>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">ℹ️</span>
              </div>
              <span className="text-amber-400 font-medium">Demo Mode</span>
            </div>
            <p className="text-amber-300 text-sm mb-4">
              This demo allows you to try all features with sample data. Your demo session data will be stored temporarily.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-amber-400">
              <span>• Add unlimited books</span>
              <span>• Test all features</span>
              <span>• No signup required</span>
              <span>• Data resets on refresh</span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">
              Ready to take your book selling to the next level?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
