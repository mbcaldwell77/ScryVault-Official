import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
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

        // Test basic database connection by querying categories
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .limit(5)

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                details: 'Database connection failed'
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            categories: categories?.length || 0,
            sample: categories?.[0] || null
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: 'Failed to connect to database'
        }, { status: 500 })
    }
}
