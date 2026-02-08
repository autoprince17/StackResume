'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, Shield, Clock, Zap } from 'lucide-react'
import { createPaymentIntent } from '@/lib/actions/student'

type Tier = 'starter' | 'professional' | 'flagship'

const tiers = [
  {
    id: 'starter' as Tier,
    name: 'Starter',
    price: 'RM129',
    priceCents: 12900,
    description: 'A clean, credible portfolio that does not hurt hiring chances.',
    features: [
      '1 template (Developer)',
      'Max 3 projects',
      'yourname.stackresume.com subdomain',
      '24-hour delivery',
      'Content edits included'
    ],
    notIncluded: [
      'Custom domain',
      'Analytics',
      'Template switching'
    ]
  },
  {
    id: 'professional' as Tier,
    name: 'Professional',
    price: 'RM229',
    priceCents: 22900,
    description: 'Competes with strong bootcamp / CS grads.',
    features: [
      'All 3 templates (Developer, Data, DevOps)',
      'Unlimited projects',
      'Custom domain support',
      'Basic analytics (views, referrers, devices)',
      'Priority 12-hour delivery',
      'Content edits included'
    ],
    popular: true
  },
  {
    id: 'flagship' as Tier,
    name: 'Flagship',
    price: 'RM499',
    priceCents: 49900,
    description: 'White-glove positioning for competitive roles.',
    features: [
      'Everything in Professional',
      'Manual design tweaks',
      'Resume optimization review',
      'LinkedIn profile review',
      'Direct email support',
      'Same-day delivery when possible'
    ]
  }
]

export default function PricingPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectTier = async (tier: Tier) => {
    setIsLoading(true)
    setSelectedTier(tier)

    try {
      const result = await createPaymentIntent(tier)
      
      if (result.success && result.clientSecret) {
        // Store payment details in session storage for checkout
        sessionStorage.setItem('paymentIntentId', result.paymentIntentId)
        sessionStorage.setItem('clientSecret', result.clientSecret)
        sessionStorage.setItem('selectedTier', tier)
        
        // Redirect to checkout page
        router.push('/checkout')
      } else {
        alert('Failed to initialize checkout. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Choose your tier
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            One-time payment. No subscriptions. No hidden fees. 
            All tiers include lifetime hosting and support.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-16 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>24-hour delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Instant access</span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`card relative ${
                tier.popular 
                  ? 'border-slate-900 ring-1 ring-slate-900 md:scale-105' 
                  : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-slate-900 text-white text-xs font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {tier.name}
                </h2>
                <p className="text-slate-600 text-sm mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {tier.price}
                  </span>
                  <span className="text-slate-500">one-time</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectTier(tier.id)}
                disabled={isLoading}
                className={`btn w-full mb-8 ${
                  tier.popular ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {isLoading && selectedTier === tier.id ? (
                  'Loading...'
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-900">
                  What is included:
                </p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.notIncluded && (
                  <>
                    <p className="text-sm font-medium text-slate-900 mt-6">
                      Not included:
                    </p>
                    <ul className="space-y-3">
                      {tier.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <span className="w-5 h-5 flex items-center justify-center text-slate-400 flex-shrink-0">
                            ×
                          </span>
                          <span className="text-slate-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently asked questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'How long does it take?',
                a: 'Most portfolios are live within 24 hours. Professional and Flagship tiers get priority processing and are often completed within 12 hours.'
              },
              {
                q: 'Can I edit my portfolio later?',
                a: 'Yes. All tiers include content edits (typos, link updates, job changes). Major redesigns or template swaps are available as paid upgrades.'
              },
              {
                q: 'What if I do not like my portfolio?',
                a: 'We review every submission before building to ensure quality. If you are not satisfied, we offer one round of revisions. Refunds available within 7 days if we cannot deliver.'
              },
              {
                q: 'Do I need a custom domain?',
                a: 'No. Every portfolio gets a free subdomain (yourname.stackresume.com). Custom domains are optional and available on Professional and Flagship tiers.'
              },
              {
                q: 'What technologies do you use?',
                a: 'We build with modern, fast technologies (Next.js, Tailwind CSS) and deploy on Vercel. You do not need to know what any of that means - we handle everything.'
              }
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-16 pt-16 border-t border-slate-200">
          <p className="text-slate-600">
            Still have questions?{' '}
            <Link href="mailto:hello@stackresume.com" className="text-slate-900 font-medium underline">
              Email us
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
