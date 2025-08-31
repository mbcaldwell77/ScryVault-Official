import { supabase } from './supabase'

// eBay API Configuration
const EBAY_APP_ID = process.env.NEXT_PUBLIC_EBAY_APP_ID!

// Validate the App ID format
if (!EBAY_APP_ID || !EBAY_APP_ID.includes('PRD-')) {
  console.error('❌ Invalid eBay App ID format. Expected format: xxx-PRD-xxxxx-xxxxx')
}
const EBAY_CERT_ID = process.env.EBAY_CERT_ID!
const EBAY_PRODUCTION_URL = process.env.NEXT_PUBLIC_EBAY_PRODUCTION_URL || 'https://api.ebay.com'
const EBAY_REDIRECT_URI_DEV = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI_DEV!
const EBAY_REDIRECT_URI_PROD = process.env.NEXT_PUBLIC_EBAY_REDIRECT_URI_PROD!

// For OAuth requests, use the RuName instead of the actual URL
// eBay will redirect to the actual URL associated with this RuName
const EBAY_RU_NAME = 'ldernTom-ScryVaul-PRD-0f0240608-25d29f7a'

// Use production for now (credentials provided are for production)
const EBAY_BASE_URL = EBAY_PRODUCTION_URL

// Debug: Log the configuration
console.log('🔧 eBay Configuration:')
console.log('- App ID:', EBAY_APP_ID)
console.log('- Base URL:', EBAY_BASE_URL)
console.log('- RuName:', EBAY_RU_NAME)
console.log('- Environment:', EBAY_BASE_URL.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION')

// Always use production redirect URI for OAuth
const EBAY_REDIRECT_URI = EBAY_REDIRECT_URI_PROD

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
      console.log('💾 Storing eBay tokens...')
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
      console.log('✅ eBay tokens stored successfully')

      this.accessToken = tokens.access_token
      this.refreshToken = tokens.refresh_token
      this.tokenExpiresAt = expiresAt
    } catch (error) {
      console.error('❌ Error storing eBay tokens:', error)
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
          scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account',
          redirect_uri: EBAY_RU_NAME  // Include redirect_uri for refresh token
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
    console.log('🔧 Generating eBay OAuth URL:')
    console.log('- Client ID:', EBAY_APP_ID)
    console.log('- RuName (for OAuth request):', EBAY_RU_NAME)
    console.log('- Actual redirect URL (configured in eBay):', EBAY_REDIRECT_URI_DEV)
    console.log('- Base URL:', EBAY_BASE_URL)
    console.log('- Environment:', EBAY_BASE_URL.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION')

    // Build URL manually to match eBay's format exactly
    const scopeParam = 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.finances https://api.ebay.com/oauth/api_scope/sell.payment.dispute https://api.ebay.com/oauth/api_scope/commerce.identity.readonly https://api.ebay.com/oauth/api_scope/sell.reputation https://api.ebay.com/oauth/api_scope/sell.reputation.readonly https://api.ebay.com/oauth/api_scope/commerce.notification.subscription https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly https://api.ebay.com/oauth/api_scope/sell.stores https://api.ebay.com/oauth/api_scope/sell.stores.readonly https://api.ebay.com/oauth/scope/sell.edelivery https://api.ebay.com/oauth/api_scope/commerce.vero'

    const url = `${ENDPOINTS.AUTHORIZATION}?client_id=${EBAY_APP_ID}&response_type=code&redirect_uri=${EBAY_RU_NAME}&scope=${encodeURIComponent(scopeParam)}${state ? `&state=${encodeURIComponent(state)}` : ''}`

    console.log('- Final OAuth URL:', url)
    console.log('ℹ️ eBay will redirect to:', EBAY_REDIRECT_URI_DEV)

    return url
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<EbayTokenResponse> {
    console.log('🔄 Starting token exchange...')
    console.log('Code length:', code.length)
    console.log('Code preview:', code.substring(0, 20) + '...')
    console.log('RuName:', EBAY_RU_NAME)
    console.log('App ID:', EBAY_APP_ID)
    console.log('Cert ID available:', !!EBAY_CERT_ID)

    try {
      const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: EBAY_RU_NAME  // Use the RuName for token exchange
      })

      console.log('Request body:', requestBody.toString())

      const response = await fetch(ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${EBAY_APP_ID}:${EBAY_CERT_ID}`)}`
        },
        body: requestBody
      })

      console.log('Token exchange response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Token exchange failed:', response.status, errorText)
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`)
      }

      const tokens: EbayTokenResponse = await response.json()
      console.log('✅ Token exchange successful!')
      console.log('Tokens received:', { 
        access_token_length: tokens.access_token?.length,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type
      })

      await this.storeTokens(tokens)
      return tokens
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      throw error
    }
  }

  // Create inventory item
  async createInventoryItem(sku: string, bookData: {
    title: string
    description?: string
    authors?: string[]
    language?: string
    published_date?: string
    isbn?: string
    condition?: string
    condition_notes?: string
    asking_price?: number
  }): Promise<EbayListingResponse> {
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
        condition: this.mapConditionToEbay(bookData.condition || 'good'),
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
  async createOffer(sku: string, bookData: {
    title: string
    description?: string
    authors?: string[]
    asking_price?: number
  }): Promise<EbayOfferResponse> {
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
      console.log('🧪 Testing eBay API configuration...')

      // Check environment variables
      console.log('EBAY_APP_ID available:', !!EBAY_APP_ID)
      console.log('EBAY_CERT_ID available:', !!process.env.EBAY_CERT_ID) // Server-side only
      console.log('EBAY_REDIRECT_URI (RuName):', EBAY_REDIRECT_URI)
      console.log('EBAY_REDIRECT_URI_DEV (actual URL):', EBAY_REDIRECT_URI_DEV)

      // Verify environment variables are available
      if (!EBAY_APP_ID) {
        throw new Error('NEXT_PUBLIC_EBAY_APP_ID environment variable is not configured. Please add it to your .env.local file.')
      }
      if (!EBAY_REDIRECT_URI_DEV) {
        throw new Error('NEXT_PUBLIC_EBAY_REDIRECT_URI_DEV environment variable is not configured. Please add it to your .env.local file.')
      }

      // Check environment consistency
      const isProduction = EBAY_BASE_URL.includes('api.ebay.com') && !EBAY_BASE_URL.includes('sandbox')
      const isProductionAppId = EBAY_APP_ID.includes('PRD-')
      console.log('Using production URLs:', isProduction)
      console.log('Using production App ID:', isProductionAppId)

      if (isProduction !== isProductionAppId) {
        console.warn('⚠️ Environment mismatch! Production App ID with sandbox URLs or vice versa.')
      }

      // Try to generate auth URL to test configuration
      console.log('🔗 Generating OAuth URL...')
      const authUrl = EbayAPI.generateAuthUrl('/test')

      // Validate the URL format
      if (!authUrl.includes('client_id=') || !authUrl.includes('redirect_uri=')) {
        throw new Error('Generated OAuth URL appears to be malformed')
      }

      // Check if the URL matches the expected format
      const expectedStart = 'https://auth.ebay.com/oauth2/authorize?'
      if (!authUrl.startsWith(expectedStart)) {
        throw new Error('OAuth URL does not use the correct eBay endpoint')
      }

      console.log('✅ OAuth URL generation successful')
      console.log('📋 Final OAuth URL:', authUrl)

      return {
        success: true,
        message: 'eBay API configuration looks good! OAuth URL generated successfully.'
      }
    } catch (error) {
      console.error('❌ eBay API test failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred during API test'
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

// Export singleton instance
export const ebayAPI = new EbayAPI()

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
export const generateEbayListingTitle = (book: {
  title: string
  authors?: string[]
}): string => {
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
  const insertionFee = 0.35 // Basic insertion fee
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
