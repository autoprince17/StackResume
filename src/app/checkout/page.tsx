'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ tier }: { tier: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/onboarding`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'Payment failed')
      setIsLoading(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, redirect to onboarding
      router.push('/onboarding')
    }
  }

  const tierDisplay = {
    starter: { name: 'Starter', price: 'RM129' },
    professional: { name: 'Professional', price: 'RM229' },
    flagship: { name: 'Flagship', price: 'RM499' }
  }

  const currentTier = tierDisplay[tier as keyof typeof tierDisplay]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600">Selected tier</p>
            <p className="font-semibold text-slate-900">{currentTier?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total</p>
            <p className="font-bold text-slate-900">{currentTier?.price}</p>
          </div>
        </div>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="btn btn-primary w-full"
      >
        {isLoading ? (
          'Processing...'
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay {currentTier?.price}
          </>
        )}
      </button>

      <p className="text-xs text-center text-slate-500">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [tier, setTier] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    // Read payment details stored by the pricing page
    const storedClientSecret = localStorage.getItem('clientSecret')
    const storedPaymentIntentId = localStorage.getItem('paymentIntentId')
    const selectedTier = localStorage.getItem('selectedTier')

    if (!storedClientSecret || !storedPaymentIntentId || !selectedTier) {
      setIsValid(false)
      return
    }

    setTier(selectedTier)
    setClientSecret(storedClientSecret)
  }, [router])

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Invalid checkout session
          </h1>
          <p className="text-slate-600 mb-6">
            Please select a tier to continue.
          </p>
          <Link href="/pricing" className="btn btn-primary">
            View Pricing
          </Link>
        </div>
      </div>
    )
  }

  if (!clientSecret || !tier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0f172a',
        colorBackground: '#ffffff',
        colorText: '#0f172a',
        colorDanger: '#ef4444',
        borderRadius: '6px',
      },
    },
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-narrow">
        <Link 
          href="/pricing" 
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to pricing
        </Link>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Complete your purchase
          </h1>
          <p className="text-slate-600 mb-8">
            Enter your payment details below. You will be redirected to the onboarding form after payment.
          </p>

          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm tier={tier} />
          </Elements>
        </div>
      </div>
    </div>
  )
}
