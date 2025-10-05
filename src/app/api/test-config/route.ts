import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const config = {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? 'SET' : 'MISSING',
            urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
            keyLength: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.length || 0
        }

        return NextResponse.json({
            success: true,
            config,
            message: config.hasSupabaseUrl && config.hasSupabaseKey ? 'Configuration looks good' : 'Missing environment variables'
        })
    } catch (e) {
        console.error('Config test error:', e)
        return NextResponse.json({ success: false, message: `Error: ${e.message}` }, { status: 500 })
    }
}
