import { BookOpen, Package, TrendingUp, Camera, Settings } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <>
      <Sidebar />
      <div className="pl-64">
        {/* Page Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              <p className="text-gray-400">Welcome back! Here's what's happening with your book business.</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
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
                <Link href="/scan" className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all duration-200">
                  <Camera className="w-5 h-5" />
                  <span>Scan New Book</span>
                </Link>
                <Link href="/inventory" className="w-full flex items-center space-x-3 p-4 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                  <Package className="w-5 h-5" />
                  <span>View Inventory</span>
                </Link>
                <Link href="/analytics" className="w-full flex items-center space-x-3 p-4 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                  <TrendingUp className="w-5 h-5" />
                  <span>Analytics Report</span>
                </Link>
                <Link href="/settings" className="w-full flex items-center space-x-3 p-4 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
