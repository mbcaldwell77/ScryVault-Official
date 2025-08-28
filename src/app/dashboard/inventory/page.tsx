import { BookOpen, Search, Filter, Plus, Eye, Edit, Trash2, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function InventoryPage() {
  return (
    <>
      {/* Page Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Inventory</h2>
            <p className="text-gray-400">Manage your book collection</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/scan" className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25">
              <Plus className="w-4 h-4 inline mr-2" />
              Add Book
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Listed</p>
                <p className="text-3xl font-bold text-white">892</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sold</p>
                <p className="text-3xl font-bold text-white">355</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-white">$45,230</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search books by title, author, or ISBN..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <select className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500">
                <option>All Status</option>
                <option>Listed</option>
                <option>Sold</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ISBN</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">List Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">COGS</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profit</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {[
                  {
                    title: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    isbn: "978-0743273565",
                    status: "Listed",
                    listPrice: "$45.00",
                    cogs: "$12.00",
                    profit: "$33.00",
                    profitMargin: "73%"
                  },
                  {
                    title: "To Kill a Mockingbird",
                    author: "Harper Lee",
                    isbn: "978-0446310789",
                    status: "Sold",
                    listPrice: "$38.00",
                    cogs: "$8.00",
                    profit: "$30.00",
                    profitMargin: "79%"
                  },
                  {
                    title: "1984",
                    author: "George Orwell",
                    isbn: "978-0451524935",
                    status: "Listed",
                    listPrice: "$32.00",
                    cogs: "$6.00",
                    profit: "$26.00",
                    profitMargin: "81%"
                  },
                  {
                    title: "Pride and Prejudice",
                    author: "Jane Austen",
                    isbn: "978-0141439518",
                    status: "Draft",
                    listPrice: "$28.00",
                    cogs: "$5.00",
                    profit: "$23.00",
                    profitMargin: "82%"
                  },
                  {
                    title: "The Hobbit",
                    author: "J.R.R. Tolkien",
                    isbn: "978-0547928241",
                    status: "Listed",
                    listPrice: "$42.00",
                    cogs: "$10.00",
                    profit: "$32.00",
                    profitMargin: "76%"
                  }
                ].map((book, index) => (
                  <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{book.title}</div>
                        <div className="text-gray-400 text-sm">{book.author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{book.isbn}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        book.status === "Listed" && "bg-blue-500/20 text-blue-400",
                        book.status === "Sold" && "bg-green-500/20 text-green-400",
                        book.status === "Draft" && "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">{book.listPrice}</td>
                    <td className="px-6 py-4 text-gray-300">{book.cogs}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-emerald-400 font-medium">{book.profit}</div>
                        <div className="text-emerald-400/70 text-sm">{book.profitMargin}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-emerald-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <div className="text-gray-400 text-sm">
            Showing 1 to 5 of 1,247 results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              Previous
            </button>
            <button className="px-3 py-2 bg-emerald-500 text-white rounded-lg">1</button>
            <button className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">2</button>
            <button className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">3</button>
            <button className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
