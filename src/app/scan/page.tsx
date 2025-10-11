"use client";

import { useState, useEffect, useRef } from "react";
import { Search, BookOpen, ArrowRight, X, Check, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { lookupBookByISBN, validateISBN, BookData, getSupabaseClient } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { demoStorage } from "@/lib/demo-storage";
import { useAuth } from "@/lib/auth-context";
import { isFeatureEnabled } from "@/lib/feature-flags";
import BarcodeScanner from "@/components/BarcodeScanner";

// Note: Sidebar component removed in favor of Header for authentication

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

export default function ScanPage() {
  // const [activeMode, setActiveMode] = useState<'camera' | 'manual' | 'upload'>('manual');
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
  const [showScanner, setShowScanner] = useState(false);
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
  const isDemoMode = !user && typeof window !== 'undefined' && localStorage.getItem('scryvault_demo_mode') === 'true'

  // Auto-focus ISBN input on page load
  useEffect(() => {
    // Small delay to ensure page is fully rendered
    const timer = setTimeout(() => {
      isbnInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load recent books and categories on component mount
  useEffect(() => {
    loadRecentBooks();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, user]);

  const loadRecentBooks = async () => {
    try {
      if (isDemoMode) {
        // In demo mode, load books from demo storage
        const demoData = await demoStorage.getData();
        const recentDemoBooks = demoData.books
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentBooks(recentDemoBooks as unknown as Record<string, unknown>[]);
        console.log('Loaded demo books:', recentDemoBooks.length);
      } else {
        // For real users, load from database
        if (!user?.id) {
          console.log('No user ID available for loading recent books');
          setRecentBooks([]);
          return;
        }

        const { data, error } = await getSupabaseClient()
          .from('books')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error loading recent books:', error);
          console.error('Full error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return;
        }

        setRecentBooks(data || []);
      }
    } catch (error) {
      console.error('Error loading recent books:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await getSupabaseClient()
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Real-time ISBN validation
  const handleISBNChange = (value: string) => {
    setIsbnInput(value);
    setError(null);

    // Clear validation if empty
    if (!value.trim()) {
      setIsbnValid(null);
      return;
    }

    // Validate as user types (but only if they've entered enough characters)
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length >= 10) {
      setIsbnValid(validateISBN(value));
    } else {
      setIsbnValid(null);
    }
  };

  const clearISBN = () => {
    setIsbnInput('');
    setIsbnValid(null);
    setError(null);
    isbnInputRef.current?.focus();
  };

  const handleISBNLookup = async () => {
    if (!isbnInput.trim()) {
      setError('Please enter an ISBN');
      return;
    }

    if (!validateISBN(isbnInput)) {
      setError('Please enter a valid ISBN (10 or 13 digits)');
      setIsbnValid(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setBookData(null);
    setShowManualForm(false);
    setShowPreview(false);

    try {
      console.log('🔍 Looking up ISBN:', isbnInput);
      const result = await lookupBookByISBN(isbnInput);
      console.log('📚 Lookup result:', result);

      if (result) {
        // Success! Show book preview
        console.log('✅ Book found:', result.title);
        setBookData(result);
        setShowPreview(true);
        setManualBookData({
          ...result,
          purchasePrice: undefined,
          askingPrice: undefined
        });
      } else {
        // Graceful failure - show manual entry form
        console.log('❌ No book found, showing manual entry');
        setManualBookData({
          title: '',
          authors: [],
          isbn: isbnInput,
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
        setShowManualForm(true);
      }
    } catch (error) {
      console.error('❌ Error during ISBN lookup:', error);
      setError(`An error occurred while looking up the book: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setShowManualForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBook = async (bookDataToSave: ManualBookData) => {
    try {
      setIsLoading(true);
      setError(null);

      // In demo mode, we save to client-side storage
      if (isDemoMode) {
        try {
          const demoBook = {
            title: bookDataToSave.title,
            authors: bookDataToSave.authors,
            isbn: bookDataToSave.isbn,
            isbn13: bookDataToSave.isbn13,
            publisher: bookDataToSave.publisher,
            published_date: bookDataToSave.publishedDate,
            page_count: bookDataToSave.pageCount,
            description: bookDataToSave.description,
            condition: bookDataToSave.condition || 'good',
            condition_notes: bookDataToSave.condition_notes,
            purchase_price: bookDataToSave.purchasePrice,
            asking_price: bookDataToSave.askingPrice,
            category: (bookDataToSave.category_id ?
              categories.find((c: Record<string, unknown>) => c.id === bookDataToSave.category_id)?.name : undefined) as string | undefined,
            tags: [],
            status: 'draft'
          };

          demoStorage.addBook(demoBook);
          setToastMessage('Demo mode: Book saved locally! Sign up to save permanently.');
          setShowToastState(true);
          setToastType('success');

          // Refresh recent books to show the newly added book
          await loadRecentBooks();
        } catch (error) {
          console.error('Error saving demo book:', error);
          setToastMessage('Error saving demo book. Please try again.');
          setShowToastState(true);
          setToastType('error');
        }
        setIsLoading(false);
        return;
      }

      // For real users, require authentication
      if (!user?.id) {
        setError('Please sign in to save books to your account.');
        return;
      }

      const userId = user.id;

      const bookData = {
        user_id: userId,
        title: bookDataToSave.title,
        authors: bookDataToSave.authors,
        isbn: bookDataToSave.isbn,
        isbn13: bookDataToSave.isbn13 || null,
        publisher: bookDataToSave.publisher || null,
        published_date: (bookDataToSave.publishedDate && bookDataToSave.publishedDate.trim() !== '') ? bookDataToSave.publishedDate : null,
        page_count: bookDataToSave.pageCount || null,
        description: bookDataToSave.description || null,
        category_id: bookDataToSave.category_id || null,
        condition: bookDataToSave.condition || 'good',
        condition_notes: bookDataToSave.condition_notes || null,
        purchase_price: bookDataToSave.purchasePrice || null,
        asking_price: bookDataToSave.askingPrice || null,
        status: 'draft'
      };

      console.log('Attempting to insert book data:', bookData);

      const { data, error } = await getSupabaseClient()
        .from('books')
        .insert([bookData])
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Error saving book:', error);
        console.error('Error type:', typeof error);
        console.error('Error keys:', Object.keys(error));
        console.error('Full error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          error: error
        });
        setError(`Failed to save book: ${error.message || 'Unknown error'}`);
        return;
      }

      // Success! Reset form and reload recent books
      setIsbnInput('');
      setIsbnValid(null);
      setBookData(null);
      setShowManualForm(false);
      setShowPreview(false);
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

      await loadRecentBooks();
      showToast(`"${bookDataToSave.title}" added successfully! ${bookDataToSave.isbn ? `ISBN: ${bookDataToSave.isbn}` : ''}`, 'success');

      // Re-focus ISBN input for fast consecutive entries
      setTimeout(() => {
        isbnInputRef.current?.focus();
      }, 500);

    } catch (error) {
      console.error('Error saving book:', error);
      setError('An unexpected error occurred while saving the book.');
    } finally {
      setIsLoading(false);
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

  const handleManualSubmit = () => {
    if (!manualBookData.title.trim()) {
      setError('Please enter a book title');
      return;
    }

    handleSaveBook(manualBookData);
  };

  const resetForm = () => {
    setIsbnInput('');
    setIsbnValid(null);
    setBookData(null);
    setShowManualForm(false);
    setShowPreview(false);
    setError(null);
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
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto p-4 lg:p-6 pt-16 lg:pt-6">
          {/* Page Header */}
          <div className="p-4 lg:p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Add Book</h2>
                <p className="text-gray-400">Add new books to your inventory</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Security Warning */}
              {isDemoMode && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-amber-400 font-medium">Demo Mode - Data Will Persist</p>
                      <p className="text-amber-300 text-sm">
                        RLS disabled for demo use. Your books will save and persist, but add authentication before production use.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-gray-400 mb-6">
                  Enter an ISBN to auto-fill book details, or add book information manually
                </p>
              </div>

              {/* ISBN Input Section */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-8 mb-6 lg:mb-8">
                {/* Scanner Button (if feature enabled) */}
                {isFeatureEnabled('BARCODE_SCANNER') && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowScanner(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>Scan Barcode</span>
                    </button>
                    <p className="text-center text-gray-400 text-sm mt-2">
                      Or enter ISBN manually below
                    </p>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ISBN Number
                      <span className="text-gray-500 ml-2 text-xs font-normal">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        ref={isbnInputRef}
                        type="text"
                        inputMode="numeric"
                        value={isbnInput}
                        onChange={(e) => handleISBNChange(e.target.value)}
                        placeholder="978-0-123456-78-9 or 0123456789"
                        className={cn(
                          "w-full px-4 py-3 pr-20 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all",
                          isbnValid === true && "border-emerald-500 focus:ring-1 focus:ring-emerald-500",
                          isbnValid === false && "border-red-500 focus:ring-1 focus:ring-red-500",
                          isbnValid === null && "border-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        )}
                        onKeyPress={(e) => e.key === 'Enter' && handleISBNLookup()}
                      />

                      {/* Validation indicator & Clear button */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {isbnValid === true && (
                          <Check className="w-5 h-5 text-emerald-400" />
                        )}
                        {isbnValid === false && (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        {isbnInput && (
                          <button
                            onClick={clearISBN}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-600"
                            aria-label="Clear ISBN"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Helpful hints */}
                    {!error && !isbnInput && (
                      <div className="flex flex-col gap-3 mt-2">
                        <div className="flex items-center text-gray-400 text-xs">
                          <span className="mr-2">💡</span>
                          <span>Type ISBN and press <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs">Enter</kbd> or click Look Up</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => {
                              resetForm();
                              setShowManualForm(true);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 text-sm underline flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            Enter details manually
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Validation feedback */}
                    {isbnValid === true && !error && (
                      <div className="flex items-center mt-2 text-emerald-400 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Valid ISBN format
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className="flex items-center mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {error}
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleISBNLookup}
                      disabled={isLoading || !isbnInput.trim()}
                      className="w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 lg:px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Looking Up...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Look Up Book
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Book Preview */}
              {showPreview && bookData && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-8 mb-6 lg:mb-8">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-white">Book Found!</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                      {bookData.imageUrl ? (
                        <Image
                          src={bookData.imageUrl}
                          alt={bookData.title}
                          width={128}
                          height={192}
                          className="w-32 h-48 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            // Hide the image and show fallback on error
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-32 h-48 bg-gray-700 rounded-lg flex items-center justify-center" style={{ display: bookData.imageUrl ? 'none' : 'flex' }}>
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{bookData.title}</h4>
                      {bookData.authors.length > 0 && (
                        <p className="text-gray-300 mb-2">
                          by {bookData.authors.join(', ')}
                        </p>
                      )}
                      <p className="text-gray-400 mb-4">ISBN: {bookData.isbn}</p>

                      {bookData.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                          {bookData.description}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                          onClick={() => handleSaveBook({ ...bookData, purchasePrice: undefined, askingPrice: undefined })}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Add to Inventory
                        </button>
                        <button
                          onClick={() => {
                            setShowPreview(false);
                            setShowManualForm(true);
                          }}
                          className="bg-gray-700 text-white px-4 lg:px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Entry Form */}
              {showManualForm && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-8 mb-6 lg:mb-8">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-white">
                      {bookData ? 'Edit Book Details' : 'Manual Entry'}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={manualBookData.title}
                        onChange={(e) => setManualBookData({ ...manualBookData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Enter book title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Authors
                      </label>
                      <input
                        type="text"
                        value={manualBookData.authors.join(', ')}
                        onChange={(e) => setManualBookData({ ...manualBookData, authors: e.target.value.split(',').map(a => a.trim()).filter(a => a) })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Author 1, Author 2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ISBN
                      </label>
                      <input
                        type="text"
                        value={manualBookData.isbn}
                        onChange={(e) => setManualBookData({ ...manualBookData, isbn: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="978-0-123456-78-9"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Publisher
                      </label>
                      <input
                        type="text"
                        value={manualBookData.publisher || ''}
                        onChange={(e) => setManualBookData({ ...manualBookData, publisher: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Publisher name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Purchase Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={manualBookData.purchasePrice || ''}
                        onChange={(e) => setManualBookData({ ...manualBookData, purchasePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Asking Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={manualBookData.askingPrice || ''}
                        onChange={(e) => setManualBookData({ ...manualBookData, askingPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={manualBookData.category_id || ''}
                        onChange={(e) => setManualBookData({ ...manualBookData, category_id: e.target.value || undefined })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id as string} value={category.id as string}>
                            {category.name as string}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Condition
                      </label>
                      <select
                        value={manualBookData.condition || ''}
                        onChange={(e) => setManualBookData({ ...manualBookData, condition: e.target.value || undefined })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
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
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Condition Notes
                    </label>
                    <textarea
                      value={manualBookData.condition_notes || ''}
                      onChange={(e) => setManualBookData({ ...manualBookData, condition_notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Any notes about the book's condition (optional)"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={manualBookData.description || ''}
                      onChange={(e) => setManualBookData({ ...manualBookData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Book description (optional)"
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleManualSubmit}
                      disabled={isLoading || !manualBookData.title.trim()}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Save Book
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetForm}
                      className="bg-gray-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Scans */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Recent Additions</h3>
                {recentBooks.length > 0 ? (
                  <div className="space-y-4">
                    {recentBooks.map((book) => (
                      <Link key={book.id as string} href="/inventory" className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{book.title as string}</p>
                          <p className="text-gray-400 text-sm">ISBN: {book.isbn as string}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-medium">
                            ${(book.asking_price as number)?.toFixed(2) || 'N/A'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(book.created_at as string).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No books in inventory yet</p>
                    <p className="text-gray-500 text-sm">Add your first book above!</p>
                  </div>
                )}
              </div>
            </div>
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
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={(isbn) => {
            console.log("Scanned ISBN:", isbn);
            setIsbnInput(isbn);
            setShowScanner(false);
            setError(null);
            // Automatically trigger lookup after scan
            setTimeout(() => {
              handleISBNLookup();
            }, 100);
          }}
          onError={(error) => {
            console.error("Scanner error:", error);
            setError(error);
            setShowScanner(false);
          }}
          onClose={() => {
            setShowScanner(false);
          }}
        />
      )}
    </AuthGuard>
  );
}
