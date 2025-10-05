import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/ebay-server'
import { EbayOfferResponse } from '@/lib/ebay'

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
    const { sku, bookData } = body

    try {
        const token = await getValidAccessToken(supabase, user.id)

        const offerData = {
            sku,
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

        const response = await fetch('https://api.ebay.com/sell/inventory/v1/offer', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
            },
            body: JSON.stringify(offerData)
        })

        if (!response.ok) {
            const errorData = await response.text()
            throw new Error(`Failed to create offer: ${response.status} - ${errorData}`)
        }

        const result: EbayOfferResponse = await response.json()
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error creating offer:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
