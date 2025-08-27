import { BookOpen, Camera, Zap, TrendingUp, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                  ScryVault
                </h1>
                <p className="text-xs text-gray-400">Scan-to-Live Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-emerald-400 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-emerald-400 transition-colors">About</a>
            </nav>
            <Link href="/dashboard" className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">AI-Powered Book Selling</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-white">Your Book Business</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              From ISBN scan to live eBay listing in minutes. 
              <br className="hidden md:block" />
              AI-powered automation that scales your profits.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/scan" className="group relative bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40">
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Start Scanning</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </Link>
            <Link href="/dashboard" className="border border-gray-600 text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-emerald-500 hover:text-emerald-400 transition-all duration-200">
              Watch Demo
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Scan-to-Live</h3>
              <p className="text-gray-400">Scan ISBN, get metadata, upload photos, and list on eBay - all in one seamless workflow.</p>
            </div>

            <div className="group p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Automation</h3>
              <p className="text-gray-400">Computer vision for condition assessment, auto-editing, and intelligent pricing algorithms.</p>
            </div>

            <div className="group p-6 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Profit Tracking</h3>
              <p className="text-gray-400">Real-time analytics, COGS tracking, and performance insights to maximize your margins.</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">90%</div>
              <div className="text-gray-400">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">5x</div>
              <div className="text-gray-400">Faster Listing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">25%</div>
              <div className="text-gray-400">Higher Profits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
              <div className="text-gray-400">AI Monitoring</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 bg-gray-900/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">ScryVault</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
