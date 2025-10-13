import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSellerPolicies } from '@/lib/ebay-server'
import { Database } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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

        // Fetch seller policies from eBay
        const policies = await getSellerPolicies(supabase, user.id)

        return NextResponse.json({
            success: true,
            policies
        })

    } catch (error) {
        console.error('Error fetching seller policies:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch seller policies',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

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
        const { paymentPolicyId, returnPolicyId, shippingPolicyId } = body

        // Update user settings with selected policies
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: dbError } = await (supabase as any)
            .from('user_settings')
            .update({
                ebay_payment_policy_id: paymentPolicyId,
                ebay_return_policy_id: returnPolicyId,
                ebay_shipping_policy_id: shippingPolicyId,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)

        if (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json(
                { error: 'Failed to save policy settings' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Policies saved successfully'
        })

    } catch (error) {
        console.error('Error saving policies:', error)
        return NextResponse.json(
            {
                error: 'Failed to save policies',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

