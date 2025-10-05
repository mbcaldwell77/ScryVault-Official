import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/ebay-server'
import { EbayListingResponse } from '@/lib/ebay' // Adjust if needed

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

        // Build inventoryData same as before
        const inventoryData = {
            sku,
            marketplaceId: 'EBAY_US',
            format: 'FIXED_PRICE',
            availability: {
                shipToLocationAvailability: {
                    quantity: 1
                }
            },
            condition: bookData.condition || 'GOOD', // Map as before
            conditionDescription: bookData.condition_notes || '',
            product: {
                title: bookData.title,
                description: bookData.description || `${bookData.title} by ${bookData.authors?.join(', ') || 'Unknown Author'}`,
                aspects: {
                    'Author': bookData.authors || ['Unknown'],
                    'Format': ['Paperback'],
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

        const response = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
            },
            body: JSON.stringify(inventoryData)
        })

        if (!response.ok) {
            const errorData = await response.text()
            throw new Error(`Failed to create inventory item: ${response.status} - ${errorData}`)
        }

        const result: EbayListingResponse = await response.json()
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error creating inventory item:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
