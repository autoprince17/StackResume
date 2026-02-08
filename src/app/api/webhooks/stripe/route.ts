import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/db/admin'

export const dynamic = 'force-dynamic'

let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    })
  }
  return stripe
}

const getWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret())
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`)
        
        // You can add logic here to update student records if needed
        // For example, mark a payment as verified in your database
        // This is useful for handling async payment methods
        
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error(`PaymentIntent ${paymentIntent.id} failed`)
        
        // Optional: Update student record or send notification
        const { data: student } = await (getSupabaseAdmin() as any)
          .from('students')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (student) {
          // Update status or send email notification
          await (getSupabaseAdmin() as any)
            .from('students')
            .update({ 
              status: 'error',
              error_message: 'Payment failed'
            })
            .eq('id', student.id)
        }

        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent ${paymentIntent.id} was canceled`)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log(`Charge ${charge.id} was refunded`)
        
        // Optional: Handle refunds (e.g., mark student as refunded, disable portfolio)
        if (charge.payment_intent) {
          const { data: student } = await (getSupabaseAdmin() as any)
            .from('students')
            .select('*')
            .eq('stripe_payment_intent_id', charge.payment_intent)
            .single()

          if (student) {
            // You might want to deactivate the portfolio or mark as refunded
            console.log(`Student ${student.id} payment was refunded`)
          }
        }
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
