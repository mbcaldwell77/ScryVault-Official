"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Check, AlertCircle, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { lookupBookByISBN, validateISBN, BookData, getSupabaseClient } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface ManualBookData {
  title: string;
  authors: string[];
  isbn: string;
  isbn13?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  description?: string;
  category_id?: string;
  condition?: string;
  condition_notes?: string;
  purchasePrice?: number;
  askingPrice?: number;
}

export default function AddBookPage() {
  const [isbnInput, setIsbnInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentBooks, setRecentBooks] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToastState, setShowToastState] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isbnValid, setIsbnValid] = useState<boolean | null>(null);
  const isbnInputRef = useRef<HTMLInputElement>(null);
  const [manualBookData, setManualBookData] = useState<ManualBookData>({
    title: '',
    authors: [],
    isbn: '',
    isbn13: '',
    publisher: '',
    publishedDate: undefined,
    pageCount: undefined,
    description: '',
    category_id: undefined,
    condition: undefined,
    condition_notes: '',
    purchasePrice: undefined,
    askingPrice: undefined
  });

  const { user } = useAuth()

  // Auto-focus ISBN input on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      isbnInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadRecentBooks = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available for loading recent books');
        setRecentBooks([]);
        return;
      }

      const { data: booksData, error: booksError } = await getSupabaseClient()
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (booksError) {
        console.error('Error loading recent books:', booksError);
        return;
      }

      setRecentBooks(booksData || []);
      console.log('Loaded recent books:', booksData?.length || 0);
    } catch (err) {
      console.error('Error loading recent books:', err);
    }
  }, [user?.id]);

  // Load recent books and categories on component mount
  useEffect(() => {
    loadRecentBooks();
    loadCategories();
  }, [user, loadRecentBooks]);

  const loadCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await getSupabaseClient()
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        return;
      }

      setCategories(categoriesData || []);
      console.log('Loaded categories:', categoriesData?.length || 0);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToastState(true);
    setTimeout(() => {
      setShowToastState(false);
      setToastMessage(null);
    }, 4000);
  };

  const handleISBNChange = (value: string) => {
    setIsbnInput(value);
    const isValid = validateISBN(value);
    setIsbnValid(isValid);
    setError(null);
  };

  const handleISBNLookup = async () => {
    if (!isbnValid) {
      setError('Please enter a valid ISBN');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookData = await lookupBookByISBN(isbnInput);
      if (bookData) {
        setBookData(bookData);
        setShowPreview(true);
        setIsbnInput('');
        setIsbnValid(null);
        showToast('Book found! Please review and add details.', 'success');
      } else {
        setError('Book not found. Please try a different ISBN or add manually.');
      }
    } catch (err) {
      console.error('Error looking up book:', err);
      setError('Failed to lookup book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    setShowManualForm(true);
    setError(null);
  };

  const handleSaveBook = async () => {
    if (!user?.id) {
      showToast('Please sign in to save books', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const bookToSave = showPreview ? {
        title: bookData?.title || '',
        authors: bookData?.authors || [],
        isbn: bookData?.isbn || '',
        isbn13: bookData?.isbn13 || '',
        publisher: bookData?.publisher || '',
        published_date: bookData?.publishedDate || null,
        page_count: bookData?.pageCount || null,
        description: bookData?.description || '',
        category_id: manualBookData.category_id || null,
        condition: manualBookData.condition || null,
        condition_notes: manualBookData.condition_notes || '',
        purchase_price: manualBookData.purchasePrice || null,
        asking_price: manualBookData.askingPrice || null,
        user_id: user.id,
        status: 'draft'
      } : {
        title: manualBookData.title,
        authors: manualBookData.authors,
        isbn: manualBookData.isbn,
        isbn13: manualBookData.isbn13 || null,
        publisher: manualBookData.publisher || null,
        published_date: manualBookData.publishedDate || null,
        page_count: manualBookData.pageCount || null,
        description: manualBookData.description || null,
        category_id: manualBookData.category_id || null,
        condition: manualBookData.condition || null,
        condition_notes: manualBookData.condition_notes || null,
        purchase_price: manualBookData.purchasePrice || null,
        asking_price: manualBookData.askingPrice || null,
        user_id: user.id,
        status: 'draft'
      };

      const { error } = await getSupabaseClient()
        .from('books')
        .insert([bookToSave]);

      if (error) {
        console.error('Error saving book:', error);
        showToast('Failed to save book. Please try again.', 'error');
        return;
      }

      showToast('Book saved successfully!', 'success');
      setBookData(null);
      setShowPreview(false);
      setShowManualForm(false);
      setManualBookData({
        title: '',
        authors: [],
        isbn: '',
        isbn13: '',
        publisher: '',
        publishedDate: undefined,
        pageCount: undefined,
        description: '',
        category_id: undefined,
        condition: undefined,
        condition_notes: '',
        purchasePrice: undefined,
        askingPrice: undefined
      });
      loadRecentBooks();
    } catch (err) {
      console.error('Error saving book:', err);
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isbnValid) {
      handleISBNLookup();
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900">
        <Header />

        {/* Page Header */}
        <div className="p-4 lg:p-6 pt-16 lg:pt-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Add Book</h2>
              <p className="text-gray-400">Add books to your inventory using ISBN lookup</p>
            </div>
            <Link href="/inventory" className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              View Inventory
            </Link>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* ISBN Input Section */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">ISBN Lookup</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      ref={isbnInputRef}
                      type="text"
                      value={isbnInput}
                      onChange={(e) => handleISBNChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter ISBN (10 or 13 digits)"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1",
                        isbnValid === false ? "border-red-500 focus:border-red-500 focus:ring-red-500" :
                          isbnValid === true ? "border-green-500 focus:border-green-500 focus:ring-green-500" :
                            "border-gray-600 focus:border-emerald-500 focus:ring-emerald-500"
                      )}
                    />
                  </div>
                  {isbnValid === false && (
                    <p className="text-red-400 text-sm mt-2">Invalid ISBN format</p>
                  )}
                  {isbnValid === true && (
                    <p className="text-green-400 text-sm mt-2">Valid ISBN</p>
                  )}
                </div>
                <button
                  onClick={handleISBNLookup}
                  disabled={!isbnValid || isLoading}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Looking up...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Lookup</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-gray-400 text-sm mb-3">Can&apos;t find the book? Add it manually:</p>
                <button
                  onClick={handleManualEntry}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manually</span>
                </button>
              </div>
            </div>

            {/* Book Preview */}
            {showPreview && bookData && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Book Found</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    {bookData.imageUrl && (
                      <div className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={bookData.imageUrl}
                          alt={bookData.title}
                          width={200}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xl font-bold text-white mb-2">{bookData.title}</h4>
                    <p className="text-gray-300 mb-2">by {bookData.authors?.join(', ') || 'Unknown Author'}</p>
                    <p className="text-gray-400 text-sm mb-2">ISBN: {bookData.isbn}</p>
                    {bookData.publisher && (
                      <p className="text-gray-400 text-sm mb-2">Publisher: {bookData.publisher}</p>
                    )}
                    {bookData.publishedDate && (
                      <p className="text-gray-400 text-sm mb-2">Published: {bookData.publishedDate}</p>
                    )}
                    {bookData.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{bookData.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Form or Book Details Form */}
            {(showManualForm || showPreview) && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {showManualForm ? 'Manual Entry' : 'Book Details'}
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={showManualForm ? manualBookData.title : (bookData?.title || '')}
                      onChange={(e) => {
                        if (showManualForm) {
                          setManualBookData({ ...manualBookData, title: e.target.value });
                        } else {
                          setBookData({ ...bookData!, title: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Authors *</label>
                    <input
                      type="text"
                      value={showManualForm ? manualBookData.authors.join(', ') : (bookData?.authors?.join(', ') || '')}
                      onChange={(e) => {
                        const authors = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                        if (showManualForm) {
                          setManualBookData({ ...manualBookData, authors });
                        } else {
                          setBookData({ ...bookData!, authors });
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Author 1, Author 2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ISBN</label>
                    <input
                      type="text"
                      value={showManualForm ? manualBookData.isbn : (bookData?.isbn || '')}
                      onChange={(e) => {
                        if (showManualForm) {
                          setManualBookData({ ...manualBookData, isbn: e.target.value });
                        } else {
                          setBookData({ ...bookData!, isbn: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Publisher</label>
                    <input
                      type="text"
                      value={showManualForm ? manualBookData.publisher || '' : (bookData?.publisher || '')}
                      onChange={(e) => {
                        if (showManualForm) {
                          setManualBookData({ ...manualBookData, publisher: e.target.value });
                        } else {
                          setBookData({ ...bookData!, publisher: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={manualBookData.category_id || ''}
                      onChange={(e) => setManualBookData({ ...manualBookData, category_id: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id as string} value={category.id as string}>
                          {category.name as string}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                    <select
                      value={manualBookData.condition || ''}
                      onChange={(e) => setManualBookData({ ...manualBookData, condition: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select condition</option>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="very_good">Very Good</option>
                      <option value="good">Good</option>
                      <option value="acceptable">Acceptable</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualBookData.purchasePrice || ''}
                      onChange={(e) => setManualBookData({ ...manualBookData, purchasePrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Asking Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualBookData.askingPrice || ''}
                      onChange={(e) => setManualBookData({ ...manualBookData, askingPrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={showManualForm ? manualBookData.description || '' : (bookData?.description || '')}
                      onChange={(e) => {
                        if (showManualForm) {
                          setManualBookData({ ...manualBookData, description: e.target.value });
                        } else {
                          setBookData({ ...bookData!, description: e.target.value });
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Book description or notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setShowManualForm(false);
                      setBookData(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBook}
                    disabled={isLoading || (!manualBookData.title || !manualBookData.authors.length)}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Book</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Recent Books */}
            {recentBooks.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Books</h3>
                <div className="grid gap-4">
                  {recentBooks.map((book) => (
                    <div key={book.id as string} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{book.title as string}</h4>
                        <p className="text-gray-400 text-sm">{(book.authors as string[])?.join(', ')}</p>
                      </div>
                      <Link
                        href="/inventory"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}