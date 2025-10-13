import { createServerClient } from '@supabase/ssr'
import { Database } from './supabase' // Adjust path if needed

type SupabaseClient = ReturnType<typeof createServerClient<Database>>

function isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt).getTime() < Date.now() + 5 * 60 * 1000 // 5 min buffer
}

export async function getEbayToken(supabase: SupabaseClient, userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from('ebay_tokens')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error || !data) {
        throw new Error('No eBay token found')
    }

    return data
}

export async function refreshEbayToken(supabase: SupabaseClient, userId: string, refreshToken: string) {
    const EBAY_APP_ID = process.env.EBAY_APP_ID!
    const EBAY_CERT_ID = process.env.EBAY_CERT_ID!
    const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token'
    const SCOPES = 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account' // Add all needed scopes

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64')}`
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            scope: SCOPES
        })
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token refresh failed: ${errorText}`)
    }

    const tokens = await response.json()

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
        .from('ebay_tokens')
        .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || refreshToken, // New refresh token if provided
            expires_at: expiresAt.toISOString()
        })

    if (dbError) {
        throw new Error('Failed to update tokens')
    }

    return tokens
}

export async function getValidAccessToken(supabase: SupabaseClient, userId: string): Promise<string> {
    const tokenData = await getEbayToken(supabase, userId)

    if (isTokenExpired(tokenData.expires_at)) {
        const newTokens = await refreshEbayToken(supabase, userId, tokenData.refresh_token)
        return newTokens.access_token
    }

    return tokenData.access_token
}

// eBay API Endpoints
const EBAY_API_BASE = 'https://api.ebay.com'
const EBAY_GRAPHQL_ENDPOINT = `${EBAY_API_BASE}/sell/inventory_mapping/v1_beta/graphql`

// eBay Inventory Mapping API - Create Listing Preview
export async function createListingPreview(
    supabase: SupabaseClient,
    userId: string,
    bookData: {
        title: string
        isbn?: string
        authors?: string[]
        publisher?: string
        publishedDate?: string
        description?: string
        condition?: string
        imageUrl?: string
        askingPrice?: number
    }
) {
    const accessToken = await getValidAccessToken(supabase, userId)

    // GraphQL mutation to create listing preview
    const mutation = `
        mutation CreateListingPreview($input: CreateListingPreviewInput!) {
            createListingPreview(input: $input) {
                taskId
                status
            }
        }
    `

    const variables = {
        input: {
            title: bookData.title,
            description: bookData.description || `${bookData.title} by ${bookData.authors?.join(', ') || 'Unknown Author'}`,
            aspects: {
                Author: bookData.authors || [],
                Publisher: bookData.publisher ? [bookData.publisher] : [],
                'Publication Year': bookData.publishedDate ? [bookData.publishedDate.split('-')[0]] : [],
                Format: ['Book'],
                Language: ['English']
            },
            productIdentifiers: bookData.isbn ? [
                {
                    type: 'ISBN',
                    value: bookData.isbn
                }
            ] : [],
            condition: mapConditionToEbay(bookData.condition || 'GOOD'),
            price: {
                value: bookData.askingPrice?.toString() || '0.00',
                currency: 'USD'
            },
            images: bookData.imageUrl ? [{ url: bookData.imageUrl }] : []
        }
    }

    const response = await fetch(EBAY_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        },
        body: JSON.stringify({
            query: mutation,
            variables
        })
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create listing preview: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    return result.data.createListingPreview
}

// Poll for listing preview completion
export async function getListingPreview(
    supabase: SupabaseClient,
    userId: string,
    taskId: string
) {
    const accessToken = await getValidAccessToken(supabase, userId)

    const query = `
        query GetListingPreview($taskId: String!) {
            listingPreview(taskId: $taskId) {
                taskId
                status
                suggestedCategory {
                    categoryId
                    categoryName
                }
                suggestedTitle
                suggestedDescription
                suggestedAspects {
                    name
                    values
                }
                suggestedPrice {
                    value
                    currency
                }
                errors {
                    message
                    field
                }
            }
        }
    `

    const response = await fetch(EBAY_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        },
        body: JSON.stringify({
            query,
            variables: { taskId }
        })
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get listing preview: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    return result.data.listingPreview
}

// Fetch seller policies
export async function getSellerPolicies(
    supabase: SupabaseClient,
    userId: string
) {
    const accessToken = await getValidAccessToken(supabase, userId)

    const [paymentPolicies, returnPolicies, shippingPolicies] = await Promise.all([
        // Fetch payment policies
        fetch(`${EBAY_API_BASE}/sell/account/v1/payment_policy?marketplace_id=EBAY_US`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }),
        // Fetch return policies
        fetch(`${EBAY_API_BASE}/sell/account/v1/return_policy?marketplace_id=EBAY_US`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }),
        // Fetch shipping policies
        fetch(`${EBAY_API_BASE}/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
    ])

    const [payment, returns, shipping] = await Promise.all([
        paymentPolicies.json(),
        returnPolicies.json(),
        shippingPolicies.json()
    ])

    return {
        paymentPolicies: payment.paymentPolicies || [],
        returnPolicies: returns.returnPolicies || [],
        shippingPolicies: shipping.fulfillmentPolicies || []
    }
}

// Fetch eBay inventory items
export async function getInventoryItems(
    supabase: SupabaseClient,
    userId: string,
    limit: number = 50,
    offset: number = 0
) {
    const accessToken = await getValidAccessToken(supabase, userId)

    const response = await fetch(
        `${EBAY_API_BASE}/sell/inventory/v1/inventory_item?limit=${limit}&offset=${offset}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch inventory: ${response.status} - ${errorText}`)
    }

    return await response.json()
}

// Fetch sales analytics
export async function getSalesAnalytics(
    supabase: SupabaseClient,
    userId: string,
    startDate: string,
    endDate: string
) {
    const accessToken = await getValidAccessToken(supabase, userId)

    // Use Sell Analytics API
    const response = await fetch(
        `${EBAY_API_BASE}/sell/analytics/v1/seller_standards_profile?filter=startDate:${startDate},endDate:${endDate}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch analytics: ${response.status} - ${errorText}`)
    }

    return await response.json()
}

// Helper function to map ScryVault condition to eBay condition
function mapConditionToEbay(condition: string): string {
    const conditionMap: Record<string, string> = {
        'new': 'NEW',
        'like_new': 'LIKE_NEW',
        'very_good': 'VERY_GOOD',
        'good': 'GOOD',
        'acceptable': 'ACCEPTABLE',
        'poor': 'FOR_PARTS_OR_NOT_WORKING'
    }
    return conditionMap[condition.toLowerCase()] || 'GOOD'
}