import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: (name, value, options) => {
                    cookieStore.set({ name, value, ...options })
                },
                remove: (name, options) => {
                    cookieStore.delete({ name, ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
        return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    const EBAY_APP_ID = process.env.EBAY_APP_ID!
    const EBAY_CERT_ID = process.env.EBAY_CERT_ID!
    const EBAY_RU_NAME = 'ldernTom-ScryVaul-PRD-0f0240608-25d29f7a' // From ebay.ts
    const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token'

    try {
        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: EBAY_RU_NAME
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json({ error: `Token exchange failed: ${errorText}` }, { status: response.status })
        }

        const tokens = await response.json()

        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

        const { error: dbError } = await supabase
            .from('ebay_tokens')
            .upsert({
                user_id: user.id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: expiresAt.toISOString(),
                scopes: [] // TODO: Add actual scopes if needed
            })

        if (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json({ error: 'Failed to store tokens' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Token exchange error:', error)
        return NextResponse.json({ error: 'Server error during token exchange' }, { status: 500 })
    }
}
