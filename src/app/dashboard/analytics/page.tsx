import { BookOpen, TrendingUp, BarChart3, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <>
      {/* Page Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            <p className="text-gray-400">Track your business performance</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">$45,230</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
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
                <p className="text-gray-400 text-sm">Books Sold</p>
                <p className="text-3xl font-bold text-white">355</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
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
                <p className="text-gray-400 text-sm">Avg. Sale Price</p>
                <p className="text-3xl font-bold text-white">$127</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
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
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-3xl font-bold text-white">28.5%</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-400">+5%</span>
              <span className="text-gray-400 ml-1">from last month</span>
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Revenue Trend</h3>
            <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Top Performing Books</h3>
            <div className="space-y-4">
              {[
                { title: "The Great Gatsby", sales: 45, revenue: "$2,025" },
                { title: "To Kill a Mockingbird", sales: 38, revenue: "$1,444" },
                { title: "1984", sales: 32, revenue: "$1,024" },
                { title: "Pride and Prejudice", sales: 28, revenue: "$784" },
              ].map((book, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{book.title}</p>
                    <p className="text-gray-400 text-sm">{book.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-medium">{book.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Sales</h3>
          <div className="space-y-4">
            {[
              { title: "The Great Gatsby", price: "$45.00", time: "2 hours ago", status: "Completed" },
              { title: "To Kill a Mockingbird", price: "$38.00", time: "4 hours ago", status: "Completed" },
              { title: "1984", price: "$32.00", time: "6 hours ago", status: "Completed" },
              { title: "Pride and Prejudice", price: "$28.00", time: "8 hours ago", status: "Completed" },
            ].map((sale, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{sale.title}</p>
                  <p className="text-gray-400 text-sm">{sale.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-medium">{sale.price}</p>
                  <p className="text-gray-400 text-xs">{sale.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
