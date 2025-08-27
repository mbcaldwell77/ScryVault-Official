import { Camera, Upload, Search, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScanPage() {
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
            <a href="/dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">AI-Powered Scanning</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Scan Your Book
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Choose your preferred method to add a new book to your inventory
            </p>
          </div>

          {/* Scan Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Camera Scan */}
            <div className="group relative bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 hover:border-emerald-500/50 hover:bg-gray-800/70 transition-all duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Camera Scan</h3>
                <p className="text-gray-400 mb-6">
                  Use your device's camera to scan the ISBN barcode directly from the book
                </p>
                <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25">
                  <Camera className="w-5 h-5 inline mr-2" />
                  Start Camera Scan
                </button>
              </div>
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="group bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 hover:border-emerald-500/50 hover:bg-gray-800/70 transition-all duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Manual Entry</h3>
                <p className="text-gray-400 mb-6">
                  Enter the ISBN manually or search by book title and author
                </p>
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25">
                  <Search className="w-5 h-5 inline mr-2" />
                  Manual Entry
                </button>
              </div>
            </div>
          </div>

          {/* Upload Option */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Upload Photo</h3>
              <p className="text-gray-400 mb-6">
                Upload a photo of the book cover or barcode for AI-powered ISBN detection
              </p>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-emerald-500 transition-colors duration-200">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Drag and drop your image here, or</p>
                <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  browse files
                </button>
              </div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Recent Scans</h3>
            <div className="space-y-4">
              {[
                { title: "The Great Gatsby", isbn: "978-0743273565", price: "$45.00", time: "2 hours ago" },
                { title: "To Kill a Mockingbird", isbn: "978-0446310789", price: "$38.00", time: "4 hours ago" },
                { title: "1984", isbn: "978-0451524935", price: "$32.00", time: "6 hours ago" },
              ].map((book, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{book.title}</p>
                    <p className="text-gray-400 text-sm">ISBN: {book.isbn}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-medium">{book.price}</p>
                    <p className="text-gray-400 text-xs">{book.time}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
