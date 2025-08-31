"use client"

import { User, Bell, Shield, Palette, HelpCircle, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { ebayAPI, EbayAPI } from "@/lib/ebay";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [ebayAuthStatus, setEbayAuthStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [ebayAuthLoading, setEbayAuthLoading] = useState(false)

  useEffect(() => {
    checkEbayAuthStatus()
  }, [])

  const checkEbayAuthStatus = async () => {
    try {
      const isAuthenticated = await ebayAPI.isAuthenticated()
      setEbayAuthStatus(isAuthenticated ? 'connected' : 'disconnected')
    } catch (error) {
      console.error('Error checking eBay auth status:', error)
      setEbayAuthStatus('disconnected')
    }
  }

  const handleEbayConnect = async () => {
    try {
      setEbayAuthLoading(true)
      const authUrl = EbayAPI.generateAuthUrl('/settings')
      window.location.href = authUrl
    } catch (error) {
      console.error('Error initiating eBay auth:', error)
      setEbayAuthLoading(false)
    }
  }

  const handleEbayDisconnect = async () => {
    try {
      await ebayAPI.logout()
      setEbayAuthStatus('disconnected')
    } catch (error) {
      console.error('Error disconnecting from eBay:', error)
    }
  }
  return (
    <AuthGuard>
      <Sidebar />
      <div className="min-h-screen bg-gray-900 lg:pl-64">
        <Header />
                                     {/* Page Header */}
           <div className="p-4 lg:p-6 pt-16 lg:pt-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

                 {/* Settings Content */}
         <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Account Settings */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-3 text-emerald-400" />
                Account Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Profile Information</p>
                    <p className="text-gray-400 text-sm">Update your personal details</p>
                  </div>
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    Edit →
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Email Address</p>
                    <p className="text-gray-400 text-sm">john.doe@example.com</p>
                  </div>
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    Change →
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Password</p>
                    <p className="text-gray-400 text-sm">Last updated 30 days ago</p>
                  </div>
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    Change →
                  </Link>
                </div>
              </div>
            </div>

            {/* eBay Integration */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ExternalLink className="w-5 h-5 mr-3 text-orange-400" />
                eBay Integration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {ebayAuthStatus === 'checking' && (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {ebayAuthStatus === 'connected' && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                    {ebayAuthStatus === 'disconnected' && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {ebayAuthStatus === 'checking' && 'Checking connection...'}
                        {ebayAuthStatus === 'connected' && 'Connected to eBay'}
                        {ebayAuthStatus === 'disconnected' && 'Not connected to eBay'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {ebayAuthStatus === 'connected'
                          ? 'Ready to create and manage eBay listings'
                          : 'Connect your eBay account to enable automated listings'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {ebayAuthStatus === 'connected' ? (
                      <button
                        onClick={handleEbayDisconnect}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEbayConnect}
                          disabled={ebayAuthLoading}
                          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
                        >
                          {ebayAuthLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Connect eBay
                        </button>
                        <button
                          onClick={async () => {
                            const result = await ebayAPI.testConnection()
                            alert(result.message)
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Test API
                        </button>
                        <button
                          onClick={() => {
                            const authUrl = EbayAPI.generateAuthUrl('/settings')
                            console.log('Auth URL:', authUrl)
                            console.log('🌐 Opening eBay OAuth page...')
                            window.open(authUrl, '_blank')
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Test OAuth
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {ebayAuthStatus === 'connected' && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Seller Policies</p>
                        <p className="text-gray-400 text-sm">Configure your eBay seller policies</p>
                      </div>
                      <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                        Configure →
                      </Link>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Listing Templates</p>
                        <p className="text-gray-400 text-sm">Set up automated listing templates</p>
                      </div>
                      <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                        Manage →
                      </Link>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Fee Calculator</p>
                        <p className="text-gray-400 text-sm">Calculate eBay fees for your listings</p>
                      </div>
                      <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                        Calculate →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-3 text-blue-400" />
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Scan Notifications</p>
                    <p className="text-gray-400 text-sm">Get notified when books are scanned</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Sale Notifications</p>
                    <p className="text-gray-400 text-sm">Get notified when books are sold</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Marketing Emails</p>
                    <p className="text-gray-400 text-sm">Receive tips and updates</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform -translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-3 text-purple-400" />
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Theme</p>
                    <p className="text-gray-400 text-sm">Current: Dark Mode</p>
                  </div>
                  <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm">
                    <option>Dark Mode</option>
                    <option>Light Mode</option>
                    <option>System</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Language</p>
                    <p className="text-gray-400 text-sm">Current: English</p>
                  </div>
                  <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-3 text-green-400" />
                Data & Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Export Data</p>
                    <p className="text-gray-400 text-sm">Download your book inventory</p>
                  </div>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Privacy Settings</p>
                    <p className="text-gray-400 text-sm">Manage your data and privacy</p>
                  </div>
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    Manage →
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-red-400 font-medium">Delete Account</p>
                    <p className="text-gray-400 text-sm">Permanently delete your account</p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Support & Help */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-3 text-cyan-400" />
                Support & Help
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Help Center</p>
                    <p className="text-gray-400 text-sm">Find answers and tutorials</p>
                  </div>
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    Visit →
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Contact Support</p>
                    <p className="text-gray-400 text-sm">Get help from our team</p>
                  </div>
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">
                    Contact →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
