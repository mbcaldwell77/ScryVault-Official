import { BookOpen, Camera, TrendingUp, Package, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                  ScryVault
                </h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <BookOpen className="w-5 h-5" />
                <span>Overview</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-emerald-400 transition-colors">
                <Camera className="w-5 h-5" />
                <span>Scan Books</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-emerald-400 transition-colors">
                <Package className="w-5 h-5" />
                <span>Inventory</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-emerald-400 transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </a>
            </div>
          </nav>

          {/* User */}
          <div className="p-6 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-gray-400">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              <p className="text-gray-400">Welcome back! Here's what's happening with your book business.</p>
            </div>
            <button className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25">
              <Camera className="w-4 h-4 inline mr-2" />
              Scan New Book
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Books</p>
                  <p className="text-3xl font-bold text-white">1,247</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400">+12%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Listings</p>
                  <p className="text-3xl font-bold text-white">892</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400">+8%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white">$12,847</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400">+23%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Profit Margin</p>
                  <p className="text-3xl font-bold text-white">34.2%</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-400">+5%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Scans</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">The Great Gatsby</p>
                      <p className="text-gray-400 text-sm">ISBN: 978-0743273565</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 text-sm">$45.00</p>
                      <p className="text-gray-400 text-xs">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all duration-200">
                  <Camera className="w-5 h-5" />
                  <span>Scan New Book</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                  <Package className="w-5 h-5" />
                  <span>View Inventory</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                  <TrendingUp className="w-5 h-5" />
                  <span>Analytics Report</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
