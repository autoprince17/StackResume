import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { TIER_PRICES } from '@/lib/tiers'

// Lazy initialization of Stripe client
let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    })
  }
  return stripe
}

export async function POST(req: NextRequest) {
  try {
    const { tier } = await req.json()

    if (!tier || !['starter', 'professional', 'flagship'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    const amount = TIER_PRICES[tier as keyof typeof TIER_PRICES]

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'myr',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tier,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
