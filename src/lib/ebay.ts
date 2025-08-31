import { supabase } from './supabase'

// eBay API Configuration
const EBAY_APP_ID = process.env.NEXT_PUBLIC_EBAY_APP_ID!
const EBAY_CERT_ID = process.env.EBAY_CERT_ID!
const EBAY_DEV_ID = process.env.EBAY_DEV_ID!
const EBAY_PRODUCTION_URL = process.env.NEXT_PUBLIC_EBAY_PRODUCTION_URL || 'https://api.ebay.com'
const EBAY_SANDBOX_URL = process.env.NEXT_PUBLIC_EBAY_SANDBOX_URL || 'https://api.sandbox.ebay.com'
const EBAY_REDIRECT_URI_DEV = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI_DEV!
const EBAY_REDIRECT_URI_PROD = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI_PROD!

// Use sandbox for development
const EBAY_BASE_URL = EBAY_SANDBOX_URL
const EBAY_REDIRECT_URI = EBAY_REDIRECT_URI_DEV

// eBay API endpoints
const ENDPOINTS = {
  AUTHORIZATION: 'https://auth.ebay.com/oauth2/authorize',
  TOKEN: 'https://api.ebay.com/identity/v1/oauth2/token',
  LISTING: `${EBAY_BASE_URL}/sell/inventory/v1/inventory_item`,
  OFFER: `${EBAY_BASE_URL}/sell/inventory/v1/offer`,
  PUBLISH_OFFER: `${EBAY_BASE_URL}/sell/inventory/v1/offer/publish`,
  LISTING_ITEM: `${EBAY_BASE_URL}/sell/inventory/v1/inventory_item/`,
  TRADITIONAL_LISTING: `${EBAY_BASE_URL}/ws/api.dll`,
} as const

// Types for eBay API responses
export interface EbayTokenResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  token_type: string
}

export interface EbayListingResponse {
  sku: string
  marketplaceId: string
  format: string
  availability: {
    shipToLocationAvailability: {
      quantity: number
    }
  }
  condition: string
  conditionDescription?: string
  product: {
    title: string
    description?: string
    aspects?: Record<string, string[]>
    brand?: string
    mpn?: string
    isbn?: string[]
  }
  pricingSummary: {
    price: {
      value: string
      currency: string
    }
  }
  packageWeightAndSize?: {
    packageType: string
    weight?: {
      value: number
      unit: string
    }
    dimensions?: {
      length: number
      width: number
      height: number
      unit: string
    }
  }
}

export interface EbayOfferResponse {
  offerId: string
  sku: string
  marketplaceId: string
  format: string
  availableQuantity: number
  pricingSummary: {
    price: {
      value: string
      currency: string
    }
  }
  listingDescription?: string
  listingPolicies?: {
    paymentPolicyId: string
    returnPolicyId: string
    shippingCostOverrides?: Array<{
      surcharge: {
        value: string
        currency: string
      }
      shippingServiceType: string
      regionIncluded: string[]
    }>
  }
}

export interface EbayPublishResponse {
  listingId: string
  marketplaceId: string
  inventoryItemGroupKey?: string
  aspects?: Record<string, string[]>
  sku: string
}

// Database types
export interface EbayUserTokens {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: Date
  created_at: Date
  updated_at: Date
}

// eBay API Client Class
export class EbayAPI {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: Date | null = null

  constructor() {
    this.loadStoredTokens()
  }

  // Load tokens from database
  private async loadStoredTokens() {
    try {
      // For demo purposes, use a fixed user ID
      const userId = '550e8400-e29b-41d4-a716-446655440000'

      // In a real implementation, you'd have a table for eBay tokens
      // For now, we'll use localStorage for demo purposes
      const tokens = localStorage.getItem(`ebay_tokens_${userId}`)
      if (tokens) {
        const parsed = JSON.parse(tokens)
        this.accessToken = parsed.access_token
        this.refreshToken = parsed.refresh_token
        this.tokenExpiresAt = new Date(parsed.expires_at)
      }
    } catch (error) {
      console.error('Error loading eBay tokens:', error)
    }
  }

  // Store tokens securely
  private async storeTokens(tokens: EbayTokenResponse) {
    try {
      // For demo purposes, use a fixed user ID
      const userId = '550e8400-e29b-41d4-a716-446655440000'

      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

      const tokenData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString()
      }

      // Store in localStorage for now (in production, use secure storage)
      localStorage.setItem(`ebay_tokens_${userId}`, JSON.stringify(tokenData))

      this.accessToken = tokens.access_token
      this.refreshToken = tokens.refresh_token
      this.tokenExpiresAt = expiresAt
    } catch (error) {
      console.error('Error storing eBay tokens:', error)
      throw error
    }
  }

  // Check if token is expired or will expire soon
  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return true
    // Consider token expired if it expires within 5 minutes
    return this.tokenExpiresAt.getTime() < (Date.now() + 5 * 60 * 1000)
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${EBAY_APP_ID}:${EBAY_CERT_ID}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account'
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const tokens: EbayTokenResponse = await response.json()
      await this.storeTokens(tokens)
    } catch (error) {
      console.error('Error refreshing eBay token:', error)
      throw error
    }
  }

  // Get valid access token
  private async getValidAccessToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken()
    }
    return this.accessToken!
  }

  // Make authenticated API request
  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getValidAccessToken()

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (response.status === 401) {
      // Token might be expired, try refreshing
      await this.refreshAccessToken()
      const newToken = await this.getValidAccessToken()

      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${newToken}`
        }
      })
    }

    return response
  }

  // Generate OAuth authorization URL
  static generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: EBAY_APP_ID,
      redirect_uri: EBAY_REDIRECT_URI,
      response_type: 'code',
      scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account',
      ...(state && { state })
    })

    return `${ENDPOINTS.AUTHORIZATION}?${params}`
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<EbayTokenResponse> {
    try {
      const response = await fetch(ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${EBAY_APP_ID}:${EBAY_CERT_ID}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: EBAY_REDIRECT_URI
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`)
      }

      const tokens: EbayTokenResponse = await response.json()
      await this.storeTokens(tokens)
      return tokens
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      throw error
    }
  }

  // Create inventory item
  async createInventoryItem(sku: string, bookData: any): Promise<EbayListingResponse> {
    try {
      const inventoryData = {
        sku: sku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        availability: {
          shipToLocationAvailability: {
            quantity: 1
          }
        },
        condition: this.mapConditionToEbay(bookData.condition),
        conditionDescription: bookData.condition_notes || '',
        product: {
          title: bookData.title,
          description: bookData.description || `${bookData.title} by ${bookData.authors?.join(', ') || 'Unknown Author'}`,
          aspects: {
            'Author': bookData.authors || ['Unknown'],
            'Format': ['Paperback'], // Default, can be enhanced
            'Language': [bookData.language || 'English'],
            'Publication Year': [bookData.published_date?.split('-')[0] || 'Unknown']
          },
          isbn: bookData.isbn ? [bookData.isbn] : []
        },
        pricingSummary: {
          price: {
            value: bookData.asking_price?.toString() || '0.00',
            currency: 'USD'
          }
        },
        packageWeightAndSize: {
          packageType: 'PACKAGE_THICK_ENVELOPE',
          weight: {
            value: 1.0,
            unit: 'POUND'
          }
        }
      }

      const response = await this.makeAuthenticatedRequest(
        `${ENDPOINTS.LISTING}/${sku}`,
        {
          method: 'PUT',
          body: JSON.stringify(inventoryData)
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create inventory item: ${response.status} - ${errorData}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating inventory item:', error)
      throw error
    }
  }

  // Create offer for inventory item
  async createOffer(sku: string, bookData: any): Promise<EbayOfferResponse> {
    try {
      const offerData = {
        sku: sku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        availableQuantity: 1,
        pricingSummary: {
          price: {
            value: bookData.asking_price?.toString() || '0.00',
            currency: 'USD'
          }
        },
        listingDescription: bookData.description || `${bookData.title} by ${bookData.authors?.join(', ') || 'Unknown Author'}`,
        listingPolicies: {
          paymentPolicyId: '123456789', // These would need to be configured in eBay seller account
          returnPolicyId: '987654321',
          shippingCostOverrides: [{
            surcharge: {
              value: '0.00',
              currency: 'USD'
            },
            shippingServiceType: 'USPSPriority',
            regionIncluded: ['US']
          }]
        }
      }

      const response = await this.makeAuthenticatedRequest(ENDPOINTS.OFFER, {
        method: 'POST',
        body: JSON.stringify(offerData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create offer: ${response.status} - ${errorData}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  }

  // Publish offer to create live listing
  async publishOffer(offerId: string): Promise<EbayPublishResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${ENDPOINTS.PUBLISH_OFFER}/${offerId}/publish`,
        {
          method: 'POST',
          body: JSON.stringify({
            marketplaceId: 'EBAY_US'
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to publish offer: ${response.status} - ${errorData}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error publishing offer:', error)
      throw error
    }
  }

  // Map ScryVault condition to eBay condition
  private mapConditionToEbay(condition: string): string {
    const conditionMap: Record<string, string> = {
      'new': 'NEW',
      'like_new': 'LIKE_NEW',
      'very_good': 'VERY_GOOD',
      'good': 'GOOD',
      'acceptable': 'ACCEPTABLE',
      'poor': 'POOR'
    }

    return conditionMap[condition] || 'GOOD'
  }

  // Check if user is authenticated with eBay
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getValidAccessToken()
      return true
    } catch {
      return false
    }
  }

  // Test eBay API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Verify environment variables are available
      if (!EBAY_APP_ID) {
        throw new Error('EBAY_APP_ID is not configured')
      }
      if (!EBAY_REDIRECT_URI) {
        throw new Error('EBAY_REDIRECT_URI is not configured')
      }

      // Try to generate auth URL to test configuration
      const authUrl = EbayAPI.generateAuthUrl('/test')

      return {
        success: true,
        message: 'eBay API configuration looks good!'
      }
    } catch (error) {
      console.error('eBay API test failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Clear stored tokens (logout)
  async logout(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        localStorage.removeItem(`ebay_tokens_${user.id}`)
      }
      this.accessToken = null
      this.refreshToken = null
      this.tokenExpiresAt = null
    } catch (error) {
      console.error('Error during eBay logout:', error)
    }
  }
}

// Export singleton instance and class
export const ebayAPI = new EbayAPI()
export { EbayAPI }

// Profit calculation utilities
export interface ProfitCalculation {
  askingPrice: number
  costOfGoods: number
  ebayFees: {
    insertionFee: number
    finalValueFee: number
    totalFees: number
  }
  shippingCost: number
  paypalFee: number
  netProfit: number
  profitMargin: number
  roi: number
}

export const calculateProfit = (
  askingPrice: number,
  costOfGoods: number,
  shippingCost: number = 0
): ProfitCalculation => {
  const ebayFees = calculateEbayFees(askingPrice)

  // PayPal fee (2.9% + $0.30 for domestic transactions)
  const paypalFee = (askingPrice * 0.029) + 0.30

  const totalCosts = costOfGoods + ebayFees.totalFees + shippingCost + paypalFee
  const netProfit = askingPrice - totalCosts
  const profitMargin = askingPrice > 0 ? (netProfit / askingPrice) * 100 : 0
  const roi = costOfGoods > 0 ? (netProfit / costOfGoods) * 100 : 0

  return {
    askingPrice,
    costOfGoods,
    ebayFees,
    shippingCost,
    paypalFee,
    netProfit,
    profitMargin,
    roi
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const getProfitColor = (profit: number): string => {
  if (profit > 50) return 'text-emerald-400'
  if (profit > 20) return 'text-green-400'
  if (profit > 0) return 'text-yellow-400'
  return 'text-red-400'
}

export const getProfitStatus = (profit: ProfitCalculation): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (profit.profitMargin > 50) return 'excellent'
  if (profit.profitMargin > 30) return 'good'
  if (profit.profitMargin > 15) return 'fair'
  return 'poor'
}

// Utility functions
export const generateEbayListingTitle = (book: any): string => {
  const title = book.title
  const authors = book.authors?.join(', ') || ''
  const maxLength = 80 // eBay title limit

  let fullTitle = title
  if (authors) {
    fullTitle = `${title} by ${authors}`
  }

  // Truncate if too long
  if (fullTitle.length > maxLength) {
    return fullTitle.substring(0, maxLength - 3) + '...'
  }

  return fullTitle
}

export const calculateEbayFees = (price: number): { insertionFee: number; finalValueFee: number; totalFees: number } => {
  // Simplified eBay fee calculation for US marketplace
  let insertionFee = 0.35 // Basic insertion fee
  let finalValueFee = 0

  // Final value fee based on price
  if (price <= 50) {
    finalValueFee = price * 0.13
  } else if (price <= 1000) {
    finalValueFee = 6.50 + (price - 50) * 0.05
  } else {
    finalValueFee = 6.50 + 475 + (price - 1000) * 0.02
  }

  return {
    insertionFee,
    finalValueFee,
    totalFees: insertionFee + finalValueFee
  }
}
