"use client";

import { BookOpen, Package, TrendingUp, Search, Filter, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Check, X, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

// Note: Sidebar component removed in favor of Header for authentication

export default function InventoryPage() {
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [books, setBooks] = useState<Record<string, unknown>[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Record<string, unknown>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Record<string, unknown> | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Record<string, unknown> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToastState, setShowToastState] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { user } = useAuth()
  const isDemoMode = !user && typeof window !== 'undefined' && localStorage.getItem('scryvault_demo_mode') === 'true'

  // Calculate real metrics from book data
  const calculateMetrics = (bookList: Record<string, unknown>[]) => {
    const totalValue = bookList.reduce((sum, book) => {
      return sum + ((book.asking_price as number) || 0);
    }, 0);

    const soldBooks = bookList.filter(book => (book.status as string) === 'sold').length;

    const totalProfit = bookList.reduce((sum, book) => {
      const askingPrice = (book.asking_price as number) || 0;
      const purchasePrice = (book.purchase_price as number) || 0;
      return sum + (askingPrice - purchasePrice);
    }, 0);

    return {
      totalValue,
      soldBooks,
      totalProfit
    };
  };

  // Sort books by field and direction
  const sortBooks = (books: Record<string, unknown>[], field: string, direction: 'asc' | 'desc') => {
    return [...books].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (field) {
        case 'title':
          aValue = (a.title as string)?.toLowerCase() || '';
          bValue = (b.title as string)?.toLowerCase() || '';
          break;
        case 'asking_price':
          aValue = (a.asking_price as number) || 0;
          bValue = (b.asking_price as number) || 0;
          break;
        case 'purchase_price':
          aValue = (a.purchase_price as number) || 0;
          bValue = (b.purchase_price as number) || 0;
          break;
        case 'profit':
          aValue = ((a.asking_price as number) || 0) - ((a.purchase_price as number) || 0);
          bValue = ((b.asking_price as number) || 0) - ((b.purchase_price as number) || 0);
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at as string);
          bValue = new Date(b.created_at as string);
          break;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  // Handle column header click for sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToastState(true);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setShowToastState(false);
      setToastMessage(null);
    }, 4000);
  };

  // Action handlers
  const handleViewBook = (book: Record<string, unknown>) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  const handleEditBook = (book: Record<string, unknown>) => {
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const handleDeleteBook = (book: Record<string, unknown>) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookToDelete.id);

      if (error) {
        console.error('Error deleting book:', error);
        showToast('Failed to delete book. Please try again.', 'error');
        return;
      }

      // Refresh data after deletion
      await fetchData();
      showToast(`"${bookToDelete.title as string}" has been deleted from your inventory.`, 'success');
    } catch (err) {
      console.error('Error deleting book:', err);
      showToast('An unexpected error occurred while deleting the book.', 'error');
    } finally {
      setShowDeleteModal(false);
      setBookToDelete(null);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedBook(null);
    setBookToDelete(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter books based on search term and status filter
  useEffect(() => {
    let filtered = books;

    // Apply status filter first
    if (statusFilter !== 'all') {
      filtered = filtered.filter((book) => {
        const status = (book.status as string)?.toLowerCase() || '';
        return status === statusFilter.toLowerCase();
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((book) => {
        const title = (book.title as string)?.toLowerCase() || '';
        const authors = (book.authors as string[])?.join(' ')?.toLowerCase() || '';
        const isbn = (book.isbn as string)?.toLowerCase() || '';

        const searchLower = searchTerm.toLowerCase();

        return title.includes(searchLower) ||
               authors.includes(searchLower) ||
               isbn.includes(searchLower);
      });
    }

    // Apply sorting
    const sorted = sortBooks(filtered, sortField, sortDirection);
    setFilteredBooks(sorted);
  }, [books, searchTerm, statusFilter, sortField, sortDirection]);

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
      setFilteredBooks(booksData || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Supabase connection error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addSampleBooks = async () => {
    try {
      setLoading(true);

      // TEMPORARY: Using demo user ID for personal use
      // Data persistence fixed by disabling RLS in database
      // TODO: Replace with proper user authentication before production/multi-user use

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
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Fiction')?.id as string,
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
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Non-Fiction')?.id as string,
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
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Science Fiction')?.id as string,
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
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Mystery')?.id as string,
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
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Biography')?.id as string,
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

      showToast('Sample books added successfully! 🎉', 'success');
    } catch (err: unknown) {
      console.error('Error adding sample books:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthGuard>
      <Sidebar />
      <div className="min-h-screen bg-gray-900 pl-64">
        <Header />
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
          {isDemoMode && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-amber-400 font-medium text-sm">Demo Mode - Data Persistence Fixed</p>
                  <p className="text-amber-300 text-xs mt-1">
                    RLS disabled for demo use. Your data will persist, but add authentication before production/multi-user use.
                  </p>
                </div>
              </div>
            </div>
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Books</p>
                <p className="text-3xl font-bold text-white">{loading ? '...' : filteredBooks.length}</p>
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
                <p className="text-3xl font-bold text-white">{loading ? '...' : calculateMetrics(filteredBooks).soldBooks}</p>
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
                <p className="text-3xl font-bold text-white">${loading ? '...' : calculateMetrics(filteredBooks).totalValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Profit</p>
                <p className="text-3xl font-bold text-white">${loading ? '...' : calculateMetrics(filteredBooks).totalProfit.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
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
                  key={category.id as string}
                  className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/30"
                  style={{ borderLeftColor: category.color as string, borderLeftWidth: '4px' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: category.color as string }}
                  >
                    {(category.name as string).charAt(0)}
                  </div>
                  <p className="text-white font-medium text-sm">{category.name as string}</p>
                  <p className="text-gray-400 text-xs mt-1">{category.description as string}</p>
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
        {!loading && filteredBooks.length > 0 && (
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
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Book</span>
                        {sortField === 'title' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ISBN</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                      onClick={() => handleSort('asking_price')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>List Price</span>
                        {sortField === 'asking_price' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                      onClick={() => handleSort('purchase_price')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>COGS</span>
                        {sortField === 'purchase_price' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                      onClick={() => handleSort('profit')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Profit</span>
                        {sortField === 'profit' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredBooks.map((book) => (
                    <tr key={book.id as string}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{book.title as string}</div>
                        <div className="text-sm text-gray-400">{(book.authors as string[])?.join(', ')}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{book.isbn as string}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                          (book.status as string) === "Listed" && "bg-blue-500/20 text-blue-400",
                          (book.status as string) === "Sold" && "bg-green-500/20 text-green-400",
                          (book.status as string) === "draft" && "bg-yellow-500/20 text-yellow-400"
                        )}>
                          {(book.status as string)?.charAt(0).toUpperCase() + (book.status as string)?.slice(1)}
                        </span>
                      </td>
                                              <td className="px-6 py-4 text-white">${(book.asking_price as number)?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-300">${(book.purchase_price as number)?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="text-emerald-400 font-semibold">${((book.asking_price as number) - (book.purchase_price as number)).toFixed(2)}</div>
                          <div className="text-emerald-400 text-sm">
                            {Math.round((((book.asking_price as number) - (book.purchase_price as number)) / (book.asking_price as number)) * 100)}%
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewBook(book)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditBook(book)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                            title="Edit Book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Book"
                          >
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="listed">Listed</option>
                <option value="sold">Sold</option>
              </select>
            </div>
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

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Book Details</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedBook.title as string}</h3>
                  <p className="text-gray-300">by {(selectedBook.authors as string[])?.join(', ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">ISBN</p>
                    <p className="text-white">{selectedBook.isbn as string}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      (selectedBook.status as string) === "Listed" && "bg-blue-500/20 text-blue-400",
                      (selectedBook.status as string) === "Sold" && "bg-green-500/20 text-green-400",
                      (selectedBook.status as string) === "draft" && "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {(selectedBook.status as string)?.charAt(0).toUpperCase() + (selectedBook.status as string)?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Purchase Price</p>
                    <p className="text-white">${(selectedBook.purchase_price as number)?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Asking Price</p>
                    <p className="text-white">${(selectedBook.asking_price as number)?.toFixed(2)}</p>
                  </div>
                </div>
                {(selectedBook.description as string) && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Description</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedBook.description as string}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal - Placeholder for now */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Edit Book</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">Edit functionality coming soon!</p>
                <p className="text-gray-400 text-sm">For now, you can edit books on the scan page.</p>
                <button
                  onClick={closeModals}
                  className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Delete Book</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Are you sure?</p>
                  <p className="text-gray-400 text-sm">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  <span className="font-medium text-white">&ldquo;{bookToDelete.title as string}&rdquo;</span> will be permanently deleted from your inventory.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToastState && toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={cn(
            "rounded-xl p-4 shadow-xl backdrop-blur-sm border",
            toastType === 'success'
              ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-500/30"
              : "bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30"
          )}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  toastType === 'success' ? "bg-emerald-500" : "bg-red-500"
                )}>
                  {toastType === 'success' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-medium text-sm",
                  toastType === 'success' ? "text-emerald-400" : "text-red-400"
                )}>
                  {toastType === 'success' ? 'Success!' : 'Error!'}
                </p>
                <p className={cn(
                  "text-sm mt-1",
                  toastType === 'success' ? "text-emerald-300" : "text-red-300"
                )}>
                  {toastMessage}
                </p>
              </div>
              <button
                onClick={() => setShowToastState(false)}
                className={cn(
                  "hover:text-white transition-colors",
                  toastType === 'success' ? "text-emerald-400" : "text-red-400"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar */}
            <div className={cn(
              "mt-3 h-1 rounded-full overflow-hidden",
              toastType === 'success' ? "bg-emerald-500/20" : "bg-red-500/20"
            )}>
              <div className={cn(
                "h-full rounded-full animate-pulse",
                toastType === 'success' ? "bg-emerald-500" : "bg-red-500"
              )}></div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
