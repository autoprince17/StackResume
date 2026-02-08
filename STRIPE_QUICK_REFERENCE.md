# Quick Stripe Setup Reference

## 1. Environment Variables (.env.local)

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 2. Database Migration (Run in Supabase SQL Editor)

```sql
-- Add stripe payment tracking fields
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_students_stripe_payment_intent 
ON students(stripe_payment_intent_id);
```

## 3. Local Development Webhook Testing

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Copy the webhook secret (whsec_...) to your .env.local
```

## 4. Production Webhook Setup

1. Go to https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Enter URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the **signing secret** to your production environment variables

## 5. Test Cards

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`
- **Expiry:** Any future date (12/34)
- **CVC:** Any 3 digits (123)

## 6. Webhook Endpoint

**URL:** `/api/webhooks/stripe`

**Events handled:**
- ✅ `payment_intent.succeeded` - Payment completed
- ✅ `payment_intent.payment_failed` - Payment declined, updates student status to error
- ✅ `payment_intent.canceled` - Payment canceled
- ✅ `charge.refunded` - Refund issued

**Security:** Verifies Stripe signature on every request

## 7. Payment Flow

```
User → Selects Tier (/pricing)
     ↓
Creates PaymentIntent (/api/create-payment-intent)
     ↓
Stripe Checkout (/checkout)
     ↓
Payment Success → Onboarding Form (/onboarding)
     ↓
Submit Form → Verify Payment → Create Student Record
     ↓
Stripe Webhook → Log event (/api/webhooks/stripe)
```

## 8. Monitoring

- **Local:** Check terminal logs from `stripe listen`
- **Production:** Stripe Dashboard → Developers → Webhooks → Click your endpoint → Events log

## 9. Common Commands

```bash
# Test webhook events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded

# View recent events
stripe events list

# View specific payment
stripe payment_intents retrieve pi_xxx
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Webhook signature verification failed" | Check `STRIPE_WEBHOOK_SECRET` matches CLI output or dashboard |
| Webhooks not received in prod | Verify URL is publicly accessible, check Stripe dashboard logs |
| Payment succeeds but record not created | Check server logs, verify payment intent ID passed to onboarding |

For full details, see `STRIPE_SETUP.md`
