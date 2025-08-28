"use client";

import { BookOpen, Package, TrendingUp, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function InventoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Test connection by fetching categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        throw categoriesError;
      }

      // Test fetching books with category information
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (booksError) {
        throw booksError;
      }

      setCategories(categoriesData || []);
      setBooks(booksData || []);
      setError(null);
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSampleBooks = async () => {
    try {
      setLoading(true);

      // For now, let's bypass the user_id requirement since we don't have auth set up yet
      // We'll insert without user_id and let Supabase handle it, or we can disable RLS temporarily

      const sampleBooks = [
        {
          title: "The Great Gatsby",
          authors: ["F. Scott Fitzgerald"],
          isbn: "978-0-7432-7356-5",
          publisher: "Scribner",
          published_date: "1925-04-10",
          page_count: 180,
          language: "English",
          description: "A classic American novel set in the Jazz Age on Long Island.",
          condition: "very_good",
          purchase_price: 15.99,
          asking_price: 25.00,
          category_id: categories.find(c => c.name === 'Fiction')?.id,
          tags: ["classic", "american literature", "jazz age"],
          status: "draft"
        },
        {
          title: "Sapiens: A Brief History of Humankind",
          authors: ["Yuval Noah Harari"],
          isbn: "978-0-06-231609-7",
          publisher: "Harper",
          published_date: "2014-01-01",
          page_count: 443,
          language: "English",
          description: "A sweeping narrative of human history from the Stone Age to the modern age.",
          condition: "like_new",
          purchase_price: 18.99,
          asking_price: 35.00,
          category_id: categories.find(c => c.name === 'Non-Fiction')?.id,
          tags: ["history", "anthropology", "bestseller"],
          status: "draft"
        },
        {
          title: "Dune",
          authors: ["Frank Herbert"],
          isbn: "978-0-441-17271-9",
          publisher: "Chilton Books",
          published_date: "1965-01-01",
          page_count: 688,
          language: "English",
          description: "Epic science fiction novel set on the desert planet Arrakis.",
          condition: "good",
          purchase_price: 12.99,
          asking_price: 40.00,
          category_id: categories.find(c => c.name === 'Science Fiction')?.id,
          tags: ["sci-fi", "space opera", "desert planet"],
          status: "draft"
        },
        {
          title: "The Silent Patient",
          authors: ["Alex Michaelides"],
          isbn: "978-1-250-30169-7",
          publisher: "Celadon Books",
          published_date: "2019-02-05",
          page_count: 336,
          language: "English",
          description: "A psychological thriller about a woman who refuses to speak after allegedly murdering her husband.",
          condition: "new",
          purchase_price: 16.99,
          asking_price: 22.00,
          category_id: categories.find(c => c.name === 'Mystery')?.id,
          tags: ["thriller", "psychological", "mystery"],
          status: "draft"
        },
        {
          title: "Educated",
          authors: ["Tara Westover"],
          isbn: "978-0-399-59050-4",
          publisher: "Random House",
          published_date: "2018-02-20",
          page_count: 334,
          language: "English",
          description: "A memoir about a woman who grows up in a survivalist Mormon family and eventually earns a PhD from Cambridge University.",
          condition: "very_good",
          purchase_price: 14.99,
          asking_price: 28.00,
          category_id: categories.find(c => c.name === 'Biography')?.id,
          tags: ["memoir", "education", "survival"],
          status: "draft"
        }
      ];

      for (const book of sampleBooks) {
        const { error } = await supabase
          .from('books')
          .insert([book]);

        if (error) {
          console.error('Error inserting book:', error);
          throw error;
        }
      }

      // Refresh data after adding books
      await fetchData();

      alert('Sample books added successfully! 🎉');
    } catch (err: any) {
      console.error('Error adding sample books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Sidebar />
      <div className="pl-64">
        {/* Page Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Inventory</h2>
              <p className="text-gray-400">Manage your book collection</p>
            </div>
            <div className="flex space-x-4">
              <a href="/scan" className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25">
                Add Book
              </a>
            </div>
          </div>
        </div>

        {/* Database Connection Status */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="bg-gray-800/30 rounded-lg p-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                <span className="text-gray-300">Connecting to Supabase...</span>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✕</span>
                </div>
                <span className="text-red-400">Connection Error: {error}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-emerald-400">
                  Connected! Found {categories.length} categories and {books.length} books
                </span>
              </div>
            )}
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
                <p className="text-3xl font-bold text-white">{loading ? '...' : books.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-3xl font-bold text-white">{loading ? '...' : categories.length}</p>
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

        {/* Categories Display */}
        {!loading && categories.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Book Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/30"
                  style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name.charAt(0)}
                  </div>
                  <p className="text-white font-medium text-sm">{category.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Data Section */}
        {!loading && books.length === 0 && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Add Sample Books</h3>
              <p className="text-gray-300 mb-4">
                Your database is connected! Add some sample books to test the full functionality.
              </p>
              <button
                onClick={addSampleBooks}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                Add 5 Sample Books 🎉
              </button>
            </div>
          </div>
        )}

        {/* Books Display */}
        {!loading && books.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden mb-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Your Books</h3>
              <button
                onClick={addSampleBooks}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add More Samples
              </button>
            </div>
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
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{book.title}</div>
                        <div className="text-sm text-gray-400">{book.authors?.join(', ')}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{book.isbn}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                          book.status === "Listed" && "bg-blue-500/20 text-blue-400",
                          book.status === "Sold" && "bg-green-500/20 text-green-400",
                          book.status === "draft" && "bg-yellow-500/20 text-yellow-400"
                        )}>
                          {book.status?.charAt(0).toUpperCase() + book.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">${book.asking_price?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-300">${book.purchase_price?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="text-emerald-400 font-semibold">${(book.asking_price - book.purchase_price).toFixed(2)}</div>
                        <div className="text-emerald-400 text-sm">
                          {Math.round(((book.asking_price - book.purchase_price) / book.asking_price) * 100)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button className="text-blue-400 hover:text-blue-300">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-300">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-300">
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
        )}

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
      </div>
    </>
  );
}
