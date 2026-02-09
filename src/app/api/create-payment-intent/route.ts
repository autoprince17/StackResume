import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { TIER_PRICES } from '@/lib/tiers'
import { getStripeSecretKey } from '@/lib/env'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

// Lazy initialization of Stripe client
let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: '2026-01-28.clover',
    })
  }
  return stripe
}

export async function POST(req: NextRequest) {
  // Rate limit: max 10 payment intent creations per IP per minute
  const rl = checkRateLimit(getClientIdentifier(req, 'create-payment-intent'), {
    maxRequests: 10,
    windowSeconds: 60,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rl.headers }
    )
  }

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
