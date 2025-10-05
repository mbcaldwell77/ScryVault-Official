import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/ebay-server'
import { EbayPublishResponse } from '@/lib/ebay'

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
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

    const body = await request.json()
    const { offerId } = body

    if (!offerId) {
        return NextResponse.json({ error: 'No offer ID provided' }, { status: 400 })
    }

    try {
        const token = await getValidAccessToken(supabase, user.id)

        const response = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
            },
            body: JSON.stringify({
                marketplaceId: 'EBAY_US'
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            throw new Error(`Failed to publish offer: ${response.status} - ${errorData}`)
        }

        const result: EbayPublishResponse = await response.json()
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error publishing offer:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
