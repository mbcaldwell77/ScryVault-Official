import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createListingPreview } from '@/lib/ebay-server'
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
        const { bookId, bookData } = body

        if (!bookData || !bookData.title) {
            return NextResponse.json(
                { error: 'Missing required book data' },
                { status: 400 }
            )
        }

        // Create listing preview via eBay API
        const previewResult = await createListingPreview(supabase, user.id, bookData)

        // Store preview task in database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: preview, error: dbError } = await (supabase as any)
            .from('ebay_listing_previews')
            .insert({
                user_id: user.id,
                book_id: bookId || null,
                preview_task_id: previewResult.taskId,
                preview_status: previewResult.status || 'pending',
                input_data: bookData
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json(
                { error: 'Failed to store preview data' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            taskId: previewResult.taskId,
            previewId: preview.id,
            status: previewResult.status
        })

    } catch (error) {
        console.error('Error creating listing preview:', error)
        return NextResponse.json(
            {
                error: 'Failed to create listing preview',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

