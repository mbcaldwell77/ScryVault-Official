"use client";

import { BookOpen, Camera, TrendingUp, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BookOpen },
    { name: 'Scan Books', href: '/scan', icon: Camera },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/settings', icon: User },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700/50">
          <Link href="/" className="flex items-center space-x-3">
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
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-emerald-400'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {typeof window !== 'undefined' && localStorage.getItem('scryvault_demo_mode') === 'true'
                  ? 'Demo User'
                  : 'ScryVault User'
                }
              </p>
              <p className="text-xs text-gray-400">
                {typeof window !== 'undefined' && localStorage.getItem('scryvault_demo_mode') === 'true'
                  ? 'Demo Mode'
                  : 'Active User'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Sidebar);