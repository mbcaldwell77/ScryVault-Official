import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getListingPreview } from '@/lib/ebay-server'
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

        // Parse request body
        const body = await request.json()
        const { taskId, previewId } = body

        if (!taskId) {
            return NextResponse.json(
                { error: 'Missing taskId' },
                { status: 400 }
            )
        }

        // Get preview status from eBay
        const previewData = await getListingPreview(supabase, user.id, taskId)

        // Update database with preview results
        if (previewId) {
            const updateData: Record<string, unknown> = {
                preview_status: previewData.status,
                ebay_response: previewData,
                updated_at: new Date().toISOString()
            }

            if (previewData.status === 'completed') {
                updateData.suggested_category_id = previewData.suggestedCategory?.categoryId
                updateData.suggested_category_name = previewData.suggestedCategory?.categoryName
                updateData.suggested_title = previewData.suggestedTitle
                updateData.suggested_description = previewData.suggestedDescription
                updateData.suggested_aspects = previewData.suggestedAspects
                updateData.suggested_price = previewData.suggestedPrice?.value
                updateData.completed_at = new Date().toISOString()
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: dbError } = await (supabase as any)
                .from('ebay_listing_previews')
                .update(updateData)
                .eq('id', previewId)
                .eq('user_id', user.id)

            if (dbError) {
                console.error('Database update error:', dbError)
            }
        }

        return NextResponse.json({
            success: true,
            status: previewData.status,
            preview: previewData
        })

    } catch (error) {
        console.error('Error polling listing preview:', error)
        return NextResponse.json(
            {
                error: 'Failed to poll listing preview',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

