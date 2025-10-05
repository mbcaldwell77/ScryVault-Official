import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-ebay-signature')

  // Verify signature
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN!
  const computedSignature = crypto.createHmac('sha256', verificationToken).update(body).digest('hex')

  if (signature !== computedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

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

  // Process events
  switch (event.topic) {
    case 'OFFER_PUBLISHED':
      // Update listing status to 'listed', set ebay_item_id
      await supabase.from('listings')
        .update({ status: 'listed', ebay_item_id: event.data.listingId })
        .eq('offer_id', event.data.offerId) // Assume we store offerId
      break
    case 'INVENTORY_ITEM_UPDATED':
      // Update book or listing
      break
    case 'MARKETPLACE_ACCOUNT_DELETION':
      // Handle account deletion
      break
    default:
      console.log('Unknown event:', event.topic)
  }

  return NextResponse.json({ success: true })
}
