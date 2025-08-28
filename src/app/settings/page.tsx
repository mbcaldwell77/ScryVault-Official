import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, CreditCard, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function SettingsPage() {
  return (
    <>
      <Sidebar />
      <div className="pl-64">
        {/* Page Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6">
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
    </>
  );
}
