import { createClient } from '@supabase/supabase-js'

// Only initialize Supabase client if we're in a browser environment or have the required env vars
const initSupabase = () => {
  // Debug environment variables
  if (typeof window !== 'undefined') {
    console.log('🔍 Supabase Environment Check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.length || 0
    })
  }

  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl ? 'SET' : 'MISSING',
      key: supabaseAnonKey ? 'SET' : 'MISSING'
    })
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    // Optimize for performance
    global: {
      headers: {
        'X-Client-Info': 'scryvault-web'
      }
    }
  })
}

export const supabase = initSupabase()

// Google Books API Configuration
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || ''
const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export const getSupabaseClient = () => {
  if (!supabase) {
    const errorMsg = 'Supabase client not initialized. Please check your environment variables:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY\n\n' +
      'Current status:\n' +
      `- URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}\n` +
      `- Key: ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? 'SET' : 'MISSING'}\n` +
      `- Environment: ${typeof window !== 'undefined' ? 'BROWSER' : 'SERVER'}`

    console.error('❌', errorMsg)
    throw new Error(errorMsg)
  }
  return supabase
}
export const supabaseService = supabase // Keep for backward compatibility

// Auth helpers
export const getCurrentUser = async () => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signUp = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) throw new Error('Supabase client not initialized')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Book data interfaces
export interface BookData {
  title: string
  authors: string[]
  isbn: string
  isbn13?: string
  publisher?: string
  publishedDate?: string
  pageCount?: number
  description?: string
  categories?: string[]
  imageUrl?: string
  language?: string
}

// Google Books API response types
interface GoogleBooksVolume {
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    language?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

interface GoogleBooksResponse {
  totalItems: number
  items?: GoogleBooksVolume[]
}

// Extract ISBN from industry identifiers
const extractISBN = (identifiers?: Array<{ type: string; identifier: string }>) => {
  if (!identifiers) return { isbn: '', isbn13: '' }

  let isbn = ''
  let isbn13 = ''

  identifiers.forEach((id) => {
    if (id.type === 'ISBN_10') {
      isbn = id.identifier
    } else if (id.type === 'ISBN_13') {
      isbn13 = id.identifier
    }
  })

  return { isbn, isbn13 }
}

// Normalize Google Books data to our format
const normalizeGoogleBooksData = (volume: GoogleBooksVolume): BookData => {
  const { isbn, isbn13 } = extractISBN(volume.volumeInfo.industryIdentifiers)

  return {
    title: volume.volumeInfo.title,
    authors: volume.volumeInfo.authors || [],
    isbn,
    isbn13,
    publisher: volume.volumeInfo.publisher,
    publishedDate: normalizePublishedDate(volume.volumeInfo.publishedDate),
    pageCount: volume.volumeInfo.pageCount,
    description: volume.volumeInfo.description,
    categories: volume.volumeInfo.categories,
    imageUrl: volume.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
    language: volume.volumeInfo.language
  }
}

// Helper function to normalize dates from Google Books API
const normalizePublishedDate = (dateStr?: string): string | undefined => {
  if (!dateStr) return undefined

  // Handle different date formats from Google Books API
  // Examples: "2020", "2020-01", "2020-01-15"

  const parts = dateStr.split('-')

  if (parts.length === 1) {
    // Year only (e.g., "2020") -> "2020-01-01"
    const year = parseInt(parts[0])
    if (year >= 1000 && year <= 9999) {
      return `${year}-01-01`
    }
  } else if (parts.length === 2) {
    // Year and month (e.g., "2020-01") -> "2020-01-01"
    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    if (year >= 1000 && year <= 9999 && month >= 1 && month <= 12) {
      return `${year}-${month.toString().padStart(2, '0')}-01`
    }
  } else if (parts.length >= 3) {
    // Full date or more (e.g., "2020-01-15") -> use as-is if valid
    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])
    if (year >= 1000 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    }
  }

  // If we can't parse it, return undefined to avoid database errors
  console.warn(`Invalid date format from Google Books API: "${dateStr}". Using undefined.`)
  return undefined
}

// Export the date normalization function for use in other parts of the app
export { normalizePublishedDate }

// Main book lookup function with graceful failure
export const lookupBookByISBN = async (isbn: string): Promise<BookData | null> => {
  try {
    // Clean the ISBN (remove hyphens, spaces)
    const cleanISBN = isbn.replace(/[-\s]/g, '')

    // Try with ISBN-13 first if available, then ISBN-10
    let searchISBN = cleanISBN
    if (cleanISBN.length === 13) {
      searchISBN = cleanISBN
    } else if (cleanISBN.length === 10) {
      // Convert ISBN-10 to ISBN-13 for better search results
      const isbn13 = convertISBN10to13(cleanISBN)
      if (isbn13) searchISBN = isbn13
    }

    const url = `${GOOGLE_BOOKS_BASE_URL}?q=isbn:${searchISBN}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=1`

    console.log(`Looking up ISBN: ${isbn} (cleaned: ${cleanISBN}, searching: ${searchISBN})`)

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('Google Books API key may be missing or invalid')
      } else {
        console.warn(`Google Books API error: ${response.status}`)
      }
      return null
    }

    const data: GoogleBooksResponse = await response.json()

    if (data.totalItems === 0) {
      console.log(`No results found for ISBN: ${isbn}`)
      return null
    }

    const bookData = normalizeGoogleBooksData(data.items![0])
    console.log(`Successfully found book: ${bookData.title}`)
    return bookData

  } catch (error: unknown) {
    console.error('Error looking up book by ISBN:', error)
    return null
  }
}

// Convert ISBN-10 to ISBN-13
const convertISBN10to13 = (isbn10: string): string | null => {
  try {
    if (isbn10.length !== 10) return null

    const base = isbn10.substring(0, 9)
    // const checkDigit = isbn10.charAt(9) // Not used in ISBN-13 conversion

    // Add 978 prefix
    const isbn13Base = '978' + base

    // Calculate ISBN-13 check digit
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn13Base.charAt(i)) * (i % 2 === 0 ? 1 : 3)
    }

    const checkDigit13 = (10 - (sum % 10)) % 10

    return isbn13Base + checkDigit13.toString()
  } catch (error: unknown) {
    console.warn('Error converting ISBN-10 to ISBN-13:', error)
    return null
  }
}

// Validate ISBN format
export const validateISBN = (isbn: string): boolean => {
  const cleanISBN = isbn.replace(/[-\s]/g, '')

  // Check if it's a valid length
  if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
    return false
  }

  // Check if all characters are digits (except last character for ISBN-10 can be X)
  if (cleanISBN.length === 10) {
    return /^\d{9}[\dX]$/i.test(cleanISBN)
  } else if (cleanISBN.length === 13) {
    return /^\d{13}$/.test(cleanISBN)
  }

  return false
}

// Search books by title/author (for manual entry assistance)
export const searchBooks = async (query: string, maxResults: number = 5): Promise<BookData[]> => {
  try {
    if (!query.trim()) return []

    const url = `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=${maxResults}&orderBy=relevance`

    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Google Books API error: ${response.status}`)
      return []
    }

    const data: GoogleBooksResponse = await response.json()

    if (data.totalItems === 0) {
      return []
    }

    return (data.items || []).map(normalizeGoogleBooksData)
  } catch (error: unknown) {
    console.error('Error searching books:', error)
    return []
  }
}

// Types for our database schema
export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          user_id: string
          title: string
          authors: string[]
          isbn: string | null
          isbn13: string | null
          publisher: string | null
          published_date: string | null
          page_count: number | null
          language: string
          description: string | null
          condition: string | null
          condition_notes: string | null
          purchase_price: number | null
          purchase_source: string | null
          purchase_date: string | null
          asking_price: number | null
          minimum_price: number | null
          category_id: string | null
          tags: string[]
          status: string
          listed_at: string | null
          sold_at: string | null
          sold_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          authors?: string[]
          isbn?: string | null
          isbn13?: string | null
          publisher?: string | null
          published_date?: string | null
          page_count?: number | null
          language?: string
          description?: string | null
          condition?: string | null
          condition_notes?: string | null
          purchase_price?: number | null
          purchase_source?: string | null
          purchase_date?: string | null
          asking_price?: number | null
          minimum_price?: number | null
          category_id?: string | null
          tags?: string[]
          status?: string
          listed_at?: string | null
          sold_at?: string | null
          sold_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          authors?: string[]
          isbn?: string | null
          isbn13?: string | null
          publisher?: string | null
          published_date?: string | null
          page_count?: number | null
          language?: string
          description?: string | null
          condition?: string | null
          condition_notes?: string | null
          purchase_price?: number | null
          purchase_source?: string | null
          purchase_date?: string | null
          asking_price?: number | null
          minimum_price?: number | null
          category_id?: string | null
          tags?: string[]
          status?: string
          listed_at?: string | null
          sold_at?: string | null
          sold_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          user_id: string
          book_id: string | null
          scan_method: string
          scanned_at: string
          raw_data: Record<string, unknown> | null
          confidence_score: number | null
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id?: string | null
          scan_method: string
          scanned_at?: string
          raw_data?: Record<string, unknown> | null
          confidence_score?: number | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string | null
          scan_method?: string
          scanned_at?: string
          raw_data?: Record<string, unknown> | null
          confidence_score?: number | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          book_id: string
          file_path: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          is_primary: boolean
          ai_description: string | null
          ai_tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          file_path: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          is_primary?: boolean
          ai_description?: string | null
          ai_tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          file_path?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          is_primary?: boolean
          ai_description?: string | null
          ai_tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          book_id: string
          user_id: string
          ebay_item_id: string | null
          title: string
          description: string | null
          start_price: number
          reserve_price: number | null
          buy_it_now_price: number | null
          category_id: number | null
          condition: string | null
          shipping_cost: number | null
          status: string
          listed_at: string | null
          ended_at: string | null
          ebay_response: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          user_id: string
          ebay_item_id?: string | null
          title: string
          description?: string | null
          start_price: number
          reserve_price?: number | null
          buy_it_now_price?: number | null
          category_id?: number | null
          condition?: string | null
          shipping_cost?: number | null
          status?: string
          listed_at?: string | null
          ended_at?: string | null
          ebay_response?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          user_id?: string
          ebay_item_id?: string | null
          title?: string
          description?: string | null
          start_price?: number
          reserve_price?: number | null
          buy_it_now_price?: number | null
          category_id?: number | null
          condition?: string | null
          shipping_cost?: number | null
          status?: string
          listed_at?: string | null
          ended_at?: string | null
          ebay_response?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          scan_notifications: boolean
          sale_notifications: boolean
          marketing_emails: boolean
          theme: string
          language: string
          default_currency: string
          default_shipping_cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scan_notifications?: boolean
          sale_notifications?: boolean
          marketing_emails?: boolean
          theme?: string
          language?: string
          default_currency?: string
          default_shipping_cost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scan_notifications?: boolean
          sale_notifications?: boolean
          marketing_emails?: boolean
          theme?: string
          language?: string
          default_currency?: string
          default_shipping_cost?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
