# Stripe Integration Setup Guide

This guide explains how to properly set up Stripe integration for StackResume, including payment processing and webhooks.

## Overview

StackResume uses Stripe for payment processing. The flow is:

1. **User selects a tier** → `/pricing` page
2. **Create PaymentIntent** → `/api/create-payment-intent`
3. **User completes payment** → `/checkout` page (Stripe Elements)
4. **Payment succeeds** → User redirects to `/onboarding`
5. **User submits form** → Payment is verified before creating student record
6. **Stripe sends webhooks** → `/api/webhooks/stripe` handles async events

## Setup Steps

### 1. Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Set Environment Variables

Create a `.env.local` file in your project root (or update your deployment platform's env vars):

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  # Get this in step 3
```

**Important:** 
- Use `test` keys for development
- Use `live` keys for production
- Never commit these to version control

### 3. Set Up Webhooks

#### Development (Local Testing)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   # Download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```
   
   This will output a webhook signing secret like `whsec_...` — **copy this and add it to your `.env.local`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_local_webhook_secret
   ```

4. **Keep the CLI running** while you develop. It will forward all Stripe events to your local app.

#### Production (Deployed App)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```

4. **Select events to listen to:**
   - `payment_intent.succeeded` ✅ (payment completed)
   - `payment_intent.payment_failed` ✅ (payment failed)
   - `payment_intent.canceled` ✅ (payment canceled)
   - `charge.refunded` ✅ (refund issued)

5. Click **Add endpoint**

6. Click on the endpoint you just created, then click **Reveal signing secret**

7. Copy the webhook secret (starts with `whsec_`) and add it to your production environment variables on Vercel/Netlify/etc.:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   ```

### 4. Update Database Schema

The `students` table needs a `stripe_payment_intent_id` column. Run this SQL in your Supabase SQL Editor:

```sql
-- Add stripe_payment_intent_id column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_stripe_payment_intent 
ON students(stripe_payment_intent_id);

-- Add error_message column for tracking payment failures (optional)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS error_message TEXT;
```

### 5. Update TypeScript Types

Update `src/types/supabase.ts` to include the new fields:

```typescript
students: {
  Row: {
    id: string
    name: string
    email: string
    tier: 'starter' | 'professional' | 'flagship'
    status: 'submitted' | 'approved' | 'deployed' | 'error'
    subdomain: string | null
    custom_domain: string | null
    cohort_id: string | null
    stripe_payment_intent_id: string | null  // ADD THIS
    error_message: string | null              // ADD THIS (optional)
    created_at: string
    updated_at: string
  }
  Insert: {
    // ... add the same fields here
    stripe_payment_intent_id?: string | null
    error_message?: string | null
  }
  Update: {
    // ... add the same fields here
    stripe_payment_intent_id?: string | null
    error_message?: string | null
  }
}
```

### 6. Test the Integration

#### Test Payment Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, start Stripe CLI:**
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

3. **Use Stripe test cards:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC

4. **Test the flow:**
   - Go to `/pricing`
   - Select a tier
   - Complete checkout with test card `4242 4242 4242 4242`
   - Check the Stripe CLI terminal for webhook events
   - Check the Next.js server logs

#### Test Webhooks

Trigger test events from the Stripe CLI:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded
```

Check your app logs and database to verify events are being processed.

### 7. Webhook Verification

The webhook endpoint at `/api/webhooks/stripe` verifies that requests are actually from Stripe using the signature header. This prevents spoofed webhook calls.

**Never skip webhook signature verification in production!**

## Webhook Event Handlers

The webhook handles these events:

### `payment_intent.succeeded`
- Payment completed successfully
- The onboarding form already verifies payment before submission, so this is mainly for logging
- Can be extended to handle async payment methods (e.g., bank transfers)

### `payment_intent.payment_failed`
- Payment declined or failed
- Updates student status to `error` if record exists
- Can trigger notification emails

### `payment_intent.canceled`
- User canceled the payment
- Logged for tracking

### `charge.refunded`
- Admin issued a refund through Stripe dashboard
- Can be extended to deactivate the student's portfolio

## Common Issues

### Issue: "Webhook signature verification failed"
**Solution:** 
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
- Use the CLI secret for local dev (`whsec_...` from `stripe listen`)
- Use the dashboard secret for production

### Issue: Webhook not receiving events in production
**Solution:**
- Check that your webhook URL is publicly accessible
- Verify the URL in Stripe Dashboard → Webhooks
- Check the webhook logs in Stripe Dashboard for errors
- Ensure your deployment doesn't have request body size limits

### Issue: Payment succeeds but student record not created
**Solution:**
- Check the server logs for errors in the onboarding submission
- Verify the payment intent ID is being passed correctly
- Check Supabase for database errors

## Security Best Practices

1. **Always verify webhook signatures** ✅ (already implemented)
2. **Never trust client-side payment status** ✅ (we verify server-side)
3. **Use idempotency** for database operations (prevent duplicate records on retry)
4. **Log all webhook events** for debugging and compliance
5. **Use environment variables** for secrets, never hardcode
6. **Use test mode** for development, live mode only in production

## Testing Checklist

Before going live:

- [ ] Test with successful payment (`4242...`)
- [ ] Test with declined card (`4000 0000 0000 0002`)
- [ ] Test with 3D Secure card (`4000 0025 0000 3155`)
- [ ] Test webhook events (use `stripe trigger`)
- [ ] Verify student records are created correctly
- [ ] Test refund handling (issue refund in Stripe Dashboard)
- [ ] Check error messages are user-friendly
- [ ] Verify webhooks work in production (check Stripe Dashboard logs)
- [ ] Test the full onboarding flow end-to-end

## Going Live

When ready for production:

1. **Switch to live mode keys** in Stripe Dashboard
2. **Update environment variables** with live keys
3. **Create production webhook endpoint** in Stripe Dashboard
4. **Update `STRIPE_WEBHOOK_SECRET`** with production secret
5. **Test with real card** (small amount, then refund)
6. **Monitor webhook deliveries** in Stripe Dashboard
7. **Set up email notifications** for failed payments

## Support

For Stripe-specific issues:
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For StackResume issues:
- Check server logs
- Check Supabase logs
- Check Stripe Dashboard webhook logs
