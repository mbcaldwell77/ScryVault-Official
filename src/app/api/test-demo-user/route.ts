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

        // Test if demo user exists
        const demoUserId = '358c3277-8f08-4ee1-a839-b660b9155ec2'

        // Try to query the demo user from auth.users (this requires service role)
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(demoUserId)

        // Try to query demo books
        const { data: booksData, error: booksError } = await supabase
            .from('books')
            .select('*')
            .eq('user_id', demoUserId)

        return NextResponse.json({
            success: true,
            demoUser: { exists: !!userData.user, data: userData.user, error: userError },
            demoBooks: { count: booksData?.length || 0, data: booksData, error: booksError }
        })
    } catch (e) {
        console.error('Server error:', e)
        const errorMessage = e instanceof Error ? e.message : 'Unknown error'
        return NextResponse.json({ success: false, message: `Server error: ${errorMessage}` }, { status: 500 })
    }
}
