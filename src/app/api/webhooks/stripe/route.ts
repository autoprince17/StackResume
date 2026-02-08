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

        // Find student by payment intent ID and mark payment as verified
        const { data: paidStudent } = await (getSupabaseAdmin() as any)
          .from('students')
          .select('id, status')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (paidStudent) {
          // Update customer ID if available
          const updates: Record<string, string | null> = {}
          if (paymentIntent.customer) {
            updates.stripe_customer_id = paymentIntent.customer as string
          }
          // Clear any previous error messages related to payment
          updates.error_message = null

          if (Object.keys(updates).length > 0) {
            await (getSupabaseAdmin() as any)
              .from('students')
              .update(updates)
              .eq('id', paidStudent.id)
          }

          console.log(`Student ${paidStudent.id} payment verified via webhook`)
        }
        
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
        
        if (charge.payment_intent) {
          const { data: refundedStudent } = await (getSupabaseAdmin() as any)
            .from('students')
            .select('id, status')
            .eq('stripe_payment_intent_id', charge.payment_intent)
            .single()

          if (refundedStudent) {
            // Mark student as refunded/errored
            await (getSupabaseAdmin() as any)
              .from('students')
              .update({ 
                status: 'error',
                error_message: 'Payment refunded'
              })
              .eq('id', refundedStudent.id)

            // Mark any queued/processing deployments as failed
            await (getSupabaseAdmin() as any)
              .from('deployment_queue')
              .update({ 
                status: 'failed',
                error_message: 'Payment refunded — deployment cancelled'
              })
              .eq('student_id', refundedStudent.id)
              .in('status', ['queued', 'processing'])

            console.log(`Student ${refundedStudent.id} marked as refunded, deployments cancelled`)
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
