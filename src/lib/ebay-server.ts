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
