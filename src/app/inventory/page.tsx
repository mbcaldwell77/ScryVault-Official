"use client";

import { BookOpen, Package, TrendingUp, Search, Filter, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Check, X, AlertCircle, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { demoStorage } from "@/lib/demo-storage";
import { ebayAPI, generateEbayListingTitle, calculateProfit, formatCurrency, getProfitColor } from "@/lib/ebay";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { DemoCategory } from "@/lib/demo-storage";

// Note: Sidebar component removed in favor of Header for authentication

export default function InventoryPage() {
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [books, setBooks] = useState<Record<string, unknown>[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Record<string, unknown>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
  const [ebayAuthStatus, setEbayAuthStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [ebayListingLoading, setEbayListingLoading] = useState<string | null>(null)

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

  // Filter helper functions
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setConditionFilter('all');
    setPriceRange({ min: '', max: '' });
    setDateRange({ start: '', end: '' });
  };

  const normalizeISBN = (isbn: string): string => {
    return isbn.replace(/[-\s]/g, '').toLowerCase();
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
      const { error } = await getSupabaseClient()
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
    checkEbayAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check eBay authentication status
  const checkEbayAuthStatus = async () => {
    try {
      const isAuthenticated = await ebayAPI.isAuthenticated()
      setEbayAuthStatus(isAuthenticated ? 'connected' : 'disconnected')
    } catch (error) {
      console.error('Error checking eBay auth status:', error)
      setEbayAuthStatus('disconnected')
    }
  }

  // Handle eBay listing creation
  const handleEbayListing = async (book: Record<string, unknown>) => {
    // Type assertion to ensure required properties exist
    const bookData = book as {
      id: string
      title: string
      description?: string
      authors?: string[]
      language?: string
      published_date?: string
      isbn?: string
      condition?: string
      condition_notes?: string
      asking_price?: number
    }
    if (ebayAuthStatus !== 'connected') {
      showToast('Please connect your eBay account first', 'error')
      return
    }

    try {
      setEbayListingLoading(book.id as string)

      // Create inventory item via API
      const inventoryRes = await fetch('/api/ebay/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: book.id, bookData: book })
      })

      if (!inventoryRes.ok) throw new Error('Failed to create inventory')

      await inventoryRes.json()

      // Create offer
      const offerRes = await fetch('/api/ebay/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: book.id, bookData: book })
      })

      if (!offerRes.ok) throw new Error('Failed to create offer')

      const offer = await offerRes.json()

      // Publish
      const publishRes = await fetch('/api/ebay/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: offer.offerId })
      })

      if (!publishRes.ok) throw new Error('Failed to publish')

      const publish = await publishRes.json()

      // Then insert to listings table as before
      await getSupabaseClient().from('listings').insert([{
        book_id: bookData.id,
        user_id: '358c3277-8f08-4ee1-a839-b660b9155ec2', // Demo user ID
        ebay_item_id: publish.listingId,
        title: generateEbayListingTitle(bookData),
        description: bookData.description || `${bookData.title} by ${bookData.authors?.join(', ') || 'Unknown Author'}`,
        start_price: bookData.asking_price,
        status: 'listed',
        ebay_response: publish
      }])

      // Update book status to listed
      await getSupabaseClient()
        .from('books')
        .update({
          status: 'listed',
          listed_at: new Date().toISOString()
        })
        .eq('id', bookData.id)

      // Refresh data
      await fetchData()

      showToast(`"${bookData.title}" has been listed on eBay!`, 'success')
    } catch (error) {
      console.error('Error creating eBay listing:', error)
      showToast('Failed to create eBay listing. Please try again.', 'error')
    } finally {
      setEbayListingLoading(null)
    }
  }

  // Filter books based on all filters
  useEffect(() => {
    let filtered = books;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((book) => {
        const status = (book.status as string)?.toLowerCase() || '';
        return status === statusFilter.toLowerCase();
      });
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((book) => {
        const categoryId = (book.category_id as string) || '';
        return categoryId === categoryFilter;
      });
    }

    // Apply condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter((book) => {
        const condition = (book.condition as string)?.toLowerCase() || '';
        return condition === conditionFilter.toLowerCase();
      });
    }

    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((book) => {
        const price = (book.asking_price as number) || 0;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((book) => {
        const bookDate = new Date(book.created_at as string);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
        return bookDate >= startDate && bookDate <= endDate;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((book) => {
        const title = (book.title as string)?.toLowerCase() || '';
        const authors = (book.authors as string[])?.join(' ')?.toLowerCase() || '';
        const isbn = (book.isbn as string) || '';
        const publisher = (book.publisher as string)?.toLowerCase() || '';

        const searchLower = searchTerm.toLowerCase();
        const normalizedSearchISBN = normalizeISBN(searchTerm);

        // Check text fields normally
        const titleMatch = title.includes(searchLower);
        const authorMatch = authors.includes(searchLower);
        const publisherMatch = publisher.includes(searchLower);

        // Check ISBN with and without hyphens
        const isbnMatch = isbn.includes(searchLower) ||
          normalizeISBN(isbn).includes(normalizedSearchISBN);

        return titleMatch || authorMatch || isbnMatch || publisherMatch;
      });
    }

    // Apply sorting
    const sorted = sortBooks(filtered, sortField, sortDirection);
    setFilteredBooks(sorted);
  }, [books, searchTerm, statusFilter, categoryFilter, conditionFilter, priceRange, dateRange, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (isDemoMode) {
        // In demo mode, load from demo storage
        const demoData = await demoStorage.getData();
        setCategories(demoData.categories as unknown as Record<string, unknown>[]);
        setBooks(demoData.books as unknown as Record<string, unknown>[]);
        setFilteredBooks(demoData.books as unknown as Record<string, unknown>[]);
        setError(null);
        console.log('Loaded demo data:', { categories: demoData.categories.length, books: demoData.books.length });
      } else {
        // For real users, load from database
        if (!user?.id) {
          setError('User not authenticated');
          setCategories([]);
          setBooks([]);
          setFilteredBooks([]);
          return;
        }

        // Test connection by fetching categories
        const { data: categoriesData, error: categoriesError } = await getSupabaseClient()
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          throw categoriesError;
        }

        // Test fetching books with category information for the authenticated user
        const { data: booksData, error: booksError } = await getSupabaseClient()
          .from('books')
          .select(`
            *,
            categories (
              name,
              color
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (booksError) {
          throw booksError;
        }

        setCategories(categoriesData || []);
        setBooks(booksData || []);
        setFilteredBooks(booksData || []);
        setError(null);
        console.log('Loaded user data:', { categories: categoriesData?.length || 0, books: booksData?.length || 0 });
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addMissingCategories = async () => {
    try {
      const missingCategories = [
        { id: crypto.randomUUID(), name: 'Fantasy', description: 'Fantasy novels, magical worlds, and supernatural fiction', color: '#a855f7' },
        { id: crypto.randomUUID(), name: 'Vintage', description: 'Classic and vintage books from previous decades', color: '#fbbf24' },
        { id: crypto.randomUUID(), name: 'Antique', description: 'Rare and antique books with historical value', color: '#dc2626' },
        { id: crypto.randomUUID(), name: 'Activity', description: 'Activity books, workbooks, and interactive materials', color: '#059669' }
      ];

      if (isDemoMode) {
        // In demo mode, add categories to demo storage
        const currentData = await demoStorage.getData();
        const existingCategoryNames = currentData.categories.map((c: DemoCategory) => c.name);

        for (const category of missingCategories) {
          if (!existingCategoryNames.includes(category.name)) {
            demoStorage.updateData({
              categories: [...currentData.categories, category]
            });
          }
        }

        showToast('Missing categories added to demo storage!', 'success');
      } else {
        // For real users, add to database
        for (const category of missingCategories) {
          const { error } = await getSupabaseClient()
            .from('categories')
            .insert([category]);

          if (error && !error.message.includes('duplicate key')) {
            console.error('Error inserting category:', error);
            throw error;
          }
        }

        showToast('Missing categories added successfully!', 'success');
      }

      // Refresh categories after adding
      await fetchData();
    } catch (err) {
      console.error('Error adding missing categories:', err);
      showToast('Failed to add missing categories', 'error');
    }
  };

  const addSampleBooks = async () => {
    try {
      setLoading(true);

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
        },
        {
          title: "The Catcher in the Rye",
          authors: ["J.D. Salinger"],
          isbn: "0316769487",
          publisher: "Little, Brown and Company",
          published_date: "1951-07-16",
          page_count: 277,
          language: "English",
          description: "A classic coming-of-age novel about teenage alienation and loss of innocence.",
          condition: "good",
          purchase_price: 8.99,
          asking_price: 18.00,
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Fiction')?.id as string,
          tags: ["classic", "coming-of-age", "american literature"],
          status: "draft"
        },
        {
          title: "The Hobbit",
          authors: ["J.R.R. Tolkien"],
          isbn: "978-0-261-10221-4",
          publisher: "George Allen & Unwin",
          published_date: "1937-09-21",
          page_count: 310,
          language: "English",
          description: "A fantasy novel about a hobbit's journey with dwarves to reclaim their homeland.",
          condition: "very_good",
          purchase_price: 12.99,
          asking_price: 45.00,
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Fantasy')?.id as string,
          tags: ["fantasy", "adventure", "classic"],
          status: "draft"
        },
        {
          title: "Vintage Cookbook Collection",
          authors: ["Various"],
          isbn: "978-0-123456-78-9",
          publisher: "Vintage Press",
          published_date: "1965-01-01",
          page_count: 250,
          language: "English",
          description: "A collection of vintage recipes from the 1960s.",
          condition: "acceptable",
          purchase_price: 5.99,
          asking_price: 25.00,
          category_id: categories.find((c: Record<string, unknown>) => c.name === 'Vintage')?.id as string,
          tags: ["vintage", "cookbook", "recipes"],
          status: "draft"
        }
      ];

      if (isDemoMode) {
        // Add each book to demo storage
        for (const book of sampleBooks) {
          const demoBook = {
            title: book.title,
            authors: book.authors,
            isbn: book.isbn,
            publisher: book.publisher,
            published_date: book.published_date,
            page_count: book.page_count,
            language: book.language,
            description: book.description,
            condition: book.condition,
            purchase_price: book.purchase_price,
            asking_price: book.asking_price,
            category: (categories.find((c: Record<string, unknown>) => c.id === book.category_id)?.name as string | undefined),
            tags: book.tags,
            status: book.status
          };
          demoStorage.addBook(demoBook);
        }

        showToast('Sample books added to demo storage! 🎉', 'success');
      } else {
        // For real users, add to database
        if (!user?.id) {
          setError('User not authenticated');
          showToast('Please sign in to add sample books', 'error');
          return;
        }

        for (const book of sampleBooks) {
          const { error } = await getSupabaseClient()
            .from('books')
            .insert([{
              ...book,
              user_id: user.id
            }]);

          if (error) {
            console.error('Error inserting book:', error);
            throw error;
          }
        }

        showToast('Sample books added successfully! 🎉', 'success');
      }

      // Refresh data after adding books
      await fetchData();
    } catch (err: unknown) {
      console.error('Error adding sample books:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to add sample books: ${errorMessage}`);
      showToast(`Failed to add sample books: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
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
        <div className="p-4 lg:p-6">

          {/* eBay Connection Notice */}
          {isFeatureEnabled('EBAY_INTEGRATION') && ebayAuthStatus === 'disconnected' && books.length > 0 && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-orange-400 font-medium">Connect eBay to Start Selling</p>
                  <p className="text-orange-300 text-sm">
                    Connect your eBay account to automatically create listings from your inventory.
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Connect Now
                </Link>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8 overflow-hidden">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-6 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm">Total Books</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{loading ? '...' : filteredBooks.length}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-6 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm">Categories</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{loading ? '...' : categories.length}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <Package className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-6 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm">Sold</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{loading ? '...' : calculateMetrics(filteredBooks).soldBooks}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-6 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white truncate">${loading ? '...' : calculateMetrics(filteredBooks).totalValue.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-6 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm">Total Profit</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white truncate">${loading ? '...' : calculateMetrics(filteredBooks).totalProfit.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Display */}
          {!loading && categories.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Book Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 overflow-hidden">
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

          {/* Sample Data Section - Only show in demo mode */}
          {!loading && books.length === 0 && isDemoMode && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Add Sample Books</h3>
                <p className="text-gray-300 mb-4">
                  Your database is connected! Add some sample books to test the full functionality.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={addSampleBooks}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    Add 5 Sample Books 🎉
                  </button>
                  <button
                    onClick={addMissingCategories}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25"
                  >
                    Add Missing Categories 📚
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters - Moved above inventory */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 lg:p-6 mb-4 lg:mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, ISBN (with or without hyphens), or publisher..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={toggleAdvancedFilters}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors",
                    showAdvancedFilters
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                      : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span>Advanced Filters</span>
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Advanced Filters Section */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="listed">Listed</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id as string} value={category.id as string}>
                          {category.name as string}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                    <select
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Conditions</option>
                      <option value="new">New</option>
                      <option value="like_new">Like New</option>
                      <option value="very_good">Very Good</option>
                      <option value="good">Good</option>
                      <option value="acceptable">Acceptable</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Added</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">From</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">To</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters Summary */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex flex-wrap gap-2">
                    {statusFilter !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter('all')}
                          className="ml-1 hover:text-blue-300"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {categoryFilter !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        Category: {categories.find(c => c.id === categoryFilter)?.name as string}
                        <button
                          onClick={() => setCategoryFilter('all')}
                          className="ml-1 hover:text-purple-300"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {conditionFilter !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Condition: {conditionFilter}
                        <button
                          onClick={() => setConditionFilter('all')}
                          className="ml-1 hover:text-green-300"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {(priceRange.min || priceRange.max) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        Price: ${priceRange.min || '0'} - ${priceRange.max || '∞'}
                        <button
                          onClick={() => setPriceRange({ min: '', max: '' })}
                          className="ml-1 hover:text-yellow-300"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {(dateRange.start || dateRange.end) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
                        Date: {dateRange.start || 'Any'} - {dateRange.end || 'Today'}
                        <button
                          onClick={() => setDateRange({ start: '', end: '' })}
                          className="ml-1 hover:text-cyan-300"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Books Display */}
          {!loading && filteredBooks.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden mb-8">
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <h3 className="text-lg font-semibold text-white">Your Books</h3>
                {isDemoMode && (
                  <button
                    onClick={addSampleBooks}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add More Samples
                  </button>
                )}
              </div>
              {/* Mobile/Tablet Card View - Hidden on desktop */}
              <div className="lg:hidden space-y-4 p-4 lg:p-6">
                {filteredBooks.map((book) => {
                  const profit = ((book.asking_price as number) || 0) - ((book.purchase_price as number) || 0);
                  const profitPercentage = ((book.asking_price as number) || 0) > 0 ? (profit / ((book.asking_price as number) || 0)) * 100 : 0;

                  return (
                    <div key={book.id as string} className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{book.title as string}</h4>
                          <p className="text-gray-400 text-xs">{(book.authors as string[])?.join(', ')}</p>
                        </div>
                        <div className="flex space-x-1 sm:space-x-2 ml-2 sm:ml-3 flex-shrink-0">
                          <button
                            onClick={() => handleViewBook(book)}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditBook(book)}
                            className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded transition-colors"
                            title="Edit Book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isFeatureEnabled('EBAY_INTEGRATION') && (book.status as string) === 'draft' && ebayAuthStatus === 'connected' && (
                            <button
                              onClick={() => handleEbayListing(book)}
                              disabled={ebayListingLoading === book.id}
                              className="p-1 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded transition-colors disabled:opacity-50"
                              title="List on eBay"
                            >
                              {ebayListingLoading === book.id ? (
                                <div className="w-4 h-4 border border-orange-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ExternalLink className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">ISBN:</span>
                          <span className="text-white ml-1">{book.isbn as string}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Category:</span>
                          <span className="text-purple-400 ml-1">{categories.find(c => c.id === book.category_id)?.name as string || 'Uncategorized'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Condition:</span>
                          <span className={cn(
                            "ml-1 inline-flex px-1 py-0.5 text-xs font-semibold rounded",
                            (book.condition as string) === "new" && "bg-green-500/20 text-green-400",
                            (book.condition as string) === "like_new" && "bg-emerald-500/20 text-emerald-400",
                            (book.condition as string) === "very_good" && "bg-blue-500/20 text-blue-400",
                            (book.condition as string) === "good" && "bg-yellow-500/20 text-yellow-400",
                            (book.condition as string) === "acceptable" && "bg-orange-500/20 text-orange-400",
                            (book.condition as string) === "poor" && "bg-red-500/20 text-red-400"
                          )}>
                            {(book.condition as string)?.replace('_', ' ')?.charAt(0).toUpperCase() + (book.condition as string)?.replace('_', ' ')?.slice(1) || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <span className={cn(
                            "ml-1 inline-flex px-1 py-0.5 text-xs font-semibold rounded",
                            (book.status as string) === "Listed" && "bg-blue-500/20 text-blue-400",
                            (book.status as string) === "Sold" && "bg-green-500/20 text-green-400",
                            (book.status as string) === "draft" && "bg-yellow-500/20 text-yellow-400"
                          )}>
                            {(book.status as string)?.charAt(0).toUpperCase() + (book.status as string)?.slice(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">List Price:</span>
                          <span className="text-white ml-1">${(book.asking_price as number)?.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">COGS:</span>
                          <span className="text-white ml-1">${(book.purchase_price as number)?.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Profit:</span>
                          <span className="text-emerald-400 font-semibold ml-1">${profit.toFixed(2)} ({profitPercentage.toFixed(1)}%)</span>
                        </div>
                        {isFeatureEnabled('EBAY_INTEGRATION') && ebayAuthStatus === 'connected' && (book.status as string) === 'draft' && (
                          <div className="col-span-2 mt-2 p-2 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">eBay Profit:</span>
                              {(() => {
                                const ebayProfit = calculateProfit(
                                  (book.asking_price as number) || 0,
                                  (book.purchase_price as number) || 0,
                                  3.99 // Standard shipping cost
                                )
                                return (
                                  <span className={`font-semibold ${getProfitColor(ebayProfit.netProfit)}`}>
                                    {formatCurrency(ebayProfit.netProfit)} ({ebayProfit.profitMargin.toFixed(1)}%)
                                  </span>
                                )
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View - Hidden on mobile/tablet */}
              <div className="hidden lg:block overflow-x-auto relative">
                {/* Scroll indicator */}
                <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-gray-800/50 to-transparent pointer-events-none z-10"></div>
                <table className="w-full min-w-[1200px]">
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Condition</th>
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
                      {isFeatureEnabled('EBAY_INTEGRATION') && (
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">eBay Profit</th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-40">Actions</th>
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
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400">
                            {categories.find(c => c.id === book.category_id)?.name as string || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                            (book.condition as string) === "new" && "bg-green-500/20 text-green-400",
                            (book.condition as string) === "like_new" && "bg-emerald-500/20 text-emerald-400",
                            (book.condition as string) === "very_good" && "bg-blue-500/20 text-blue-400",
                            (book.condition as string) === "good" && "bg-yellow-500/20 text-yellow-400",
                            (book.condition as string) === "acceptable" && "bg-orange-500/20 text-orange-400",
                            (book.condition as string) === "poor" && "bg-red-500/20 text-red-400"
                          )}>
                            {(book.condition as string)?.replace('_', ' ')?.charAt(0).toUpperCase() + (book.condition as string)?.replace('_', ' ')?.slice(1) || 'Unknown'}
                          </span>
                        </td>
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
                        {isFeatureEnabled('EBAY_INTEGRATION') && (
                          <td className="px-6 py-4">
                            {ebayAuthStatus === 'connected' && (book.status as string) === 'draft' ? (() => {
                              const ebayProfit = calculateProfit(
                                (book.asking_price as number) || 0,
                                (book.purchase_price as number) || 0,
                                3.99 // Standard shipping cost
                              )
                              return (
                                <div className="text-sm">
                                  <div className={`font-semibold ${getProfitColor(ebayProfit.netProfit)}`}>
                                    {formatCurrency(ebayProfit.netProfit)}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {ebayProfit.profitMargin.toFixed(1)}% margin
                                  </div>
                                </div>
                              )
                            })() : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 w-40">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewBook(book)}
                              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditBook(book)}
                              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded transition-colors"
                              title="Edit Book"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {isFeatureEnabled('EBAY_INTEGRATION') && (book.status as string) === 'draft' && ebayAuthStatus === 'connected' && (
                              <button
                                onClick={() => handleEbayListing(book)}
                                disabled={ebayListingLoading === book.id}
                                className="p-1 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded transition-colors disabled:opacity-50"
                                title="List on eBay"
                              >
                                {ebayListingLoading === book.id ? (
                                  <div className="w-4 h-4 border border-orange-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <ExternalLink className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBook(book)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
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
