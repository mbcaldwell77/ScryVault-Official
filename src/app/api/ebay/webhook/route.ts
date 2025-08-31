import { NextRequest, NextResponse } from 'next/server'

// eBay webhook verification token (should match what's configured in eBay developer portal)
const EBAY_VERIFICATION_TOKEN = 'ldernTom-ScryVaul-PRD-0f0240608-25d29f7a'

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 eBay webhook GET request received')
    
    // Handle eBay webhook verification challenge
    const { searchParams } = new URL(request.url)
    const challengeCode = searchParams.get('challenge_code')
    const verificationToken = searchParams.get('verification_token')
    
    console.log('Challenge code:', challengeCode)
    console.log('Verification token:', verificationToken)
    console.log('Expected token:', EBAY_VERIFICATION_TOKEN)
    
    // Verify the token matches
    if (verificationToken !== EBAY_VERIFICATION_TOKEN) {
      console.error('❌ Verification token mismatch')
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 403 }
      )
    }
    
    if (challengeCode) {
      console.log('✅ Responding to eBay webhook challenge')
      return NextResponse.json({
        challengeResponse: challengeCode
      })
    }
    
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('❌ Error handling eBay webhook GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 eBay webhook POST request received')
    
    const body = await request.json()
    console.log('Webhook payload:', JSON.stringify(body, null, 2))
    
    // Handle different types of eBay notifications
    const notificationType = body.metadata?.topic || body.topic
    
    switch (notificationType) {
      case 'MARKETPLACE_ACCOUNT_DELETION':
        console.log('📋 Processing marketplace account deletion notification')
        // Handle account deletion notification
        // This would typically involve cleaning up user data
        break
        
      case 'INVENTORY_ITEM_UPDATED':
        console.log('📦 Processing inventory item update')
        // Handle inventory updates
        break
        
      case 'OFFER_PUBLISHED':
        console.log('📢 Processing offer published notification')
        // Handle new listing published
        break
        
      default:
        console.log('ℹ️ Unknown notification type:', notificationType)
    }
    
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('❌ Error handling eBay webhook POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
