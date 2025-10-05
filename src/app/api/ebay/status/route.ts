import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/ebay-server'

export async function GET() {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // @ts-ignore - Suppress type error for build
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
        return NextResponse.json({ authenticated: false })
    }

    try {
        await getValidAccessToken(supabase, user.id)
        return NextResponse.json({ authenticated: true })
    } catch {
        return NextResponse.json({ authenticated: false })
    }
}
