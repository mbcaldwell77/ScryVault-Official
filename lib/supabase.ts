import { createClient } from '@supabase/supabase-js'

// Handle missing environment variables during static generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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
