import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getInventoryItems } from '@/lib/ebay-server'
import { Database } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: (cookiesToSet) => {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Create sync log entry
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: syncLog, error: logError } = await (supabase as any)
            .from('ebay_sync_log')
            .insert({
                user_id: user.id,
                sync_type: 'inventory',
                sync_status: 'started'
            })
            .select()
            .single()

        if (logError) {
            console.error('Failed to create sync log:', logError)
        }

        // Fetch inventory from eBay
        const inventoryData = await getInventoryItems(supabase, user.id, 100, 0)

        let itemsSynced = 0
        let itemsFailed = 0

        // Process inventory items
        if (inventoryData.inventoryItems && Array.isArray(inventoryData.inventoryItems)) {
            for (const item of inventoryData.inventoryItems) {
                try {
                    // Find matching book by ISBN or SKU
                    const isbn = item.product?.isbn?.[0]
                    const sku = item.sku

                    if (isbn || sku) {
                        // Check if book exists in our database
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const { data: existingBook } = await (supabase as any)
                            .from('books')
                            .select('id')
                            .eq('user_id', user.id)
                            .or(isbn ? `isbn.eq.${isbn},ebay_sku.eq.${sku}` : `ebay_sku.eq.${sku}`)
                            .single()

                        if (existingBook) {
                            // Update existing book with eBay data
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            await (supabase as any)
                                .from('books')
                                .update({
                                    ebay_sku: sku,
                                    ebay_status: item.availability?.shipToLocationAvailability?.quantity > 0 ? 'active' : 'ended',
                                    ebay_sync_enabled: true,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', existingBook.id)

                            itemsSynced++
                        }
                    }
                } catch (error) {
                    console.error('Error syncing item:', error)
                    itemsFailed++
                }
            }
        }

        // Update sync log with results
        if (syncLog) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('ebay_sync_log')
                .update({
                    sync_status: 'completed',
                    items_synced: itemsSynced,
                    items_failed: itemsFailed,
                    completed_at: new Date().toISOString(),
                    sync_data: {
                        total_items: inventoryData.total || 0,
                        processed: itemsSynced + itemsFailed
                    }
                })
                .eq('id', syncLog.id)
        }

        // Update user settings with last sync time
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('user_settings')
            .update({
                ebay_last_sync: new Date().toISOString()
            })
            .eq('user_id', user.id)

        return NextResponse.json({
            success: true,
            itemsSynced,
            itemsFailed,
            totalItems: inventoryData.total || 0
        })

    } catch (error) {
        console.error('Error syncing inventory:', error)
        return NextResponse.json(
            {
                error: 'Failed to sync inventory',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

