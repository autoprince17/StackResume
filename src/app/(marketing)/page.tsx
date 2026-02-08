import Link from 'next/link'
import { Check, ArrowRight, Code, Palette, Rocket } from 'lucide-react'

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-32 md:pb-40">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 mb-8">
            <Rocket className="w-4 h-4" />
            <span>Live portfolio in 24 hours, guaranteed</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Stop sending PDFs.
            <br />
            Start getting callbacks.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            We build recruiter-ready portfolio websites for technical students. 
            No coding. No design decisions. Just fill out one form and we handle the rest.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing" className="btn btn-primary text-base w-full sm:w-auto">
              Create My Portfolio
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link href="/examples" className="btn btn-secondary text-base w-full sm:w-auto">
              See Examples
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-slate-500">
            One-time payment. No subscriptions. No hidden fees.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="container-wide">
          <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wide mb-8">
            Students from top programs trust StackResume
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {['UC Berkeley', 'MIT', 'Stanford', 'Georgia Tech', 'CMU'].map((school) => (
              <span key={school} className="text-lg font-semibold text-slate-400">
                {school}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Zero technical knowledge required
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We have removed every friction point. No tutorials. No templates to customize. 
              Just tell us about yourself and we build the rest.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: 'Fill out one form',
                description: 'Share your projects, experience, and skills. Takes 5-10 minutes. We will even parse your resume to speed it up.'
              },
              {
                icon: Palette,
                title: 'We build it',
                description: 'Our team reviews your submission for quality, selects the optimal layout for your role, and builds your portfolio.'
              },
              {
                icon: Rocket,
                title: 'Go live',
                description: 'Get your custom subdomain within 24 hours. Share it with recruiters, on LinkedIn, and in applications.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-24 bg-slate-50">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Recruiter-optimized by design
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Every portfolio we build follows proven patterns that help recruiters 
                quickly understand your value. No flashy animations. No confusing navigation.
                Just clear, professional presentation.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Mobile-responsive design',
                  'SEO optimized for your name + role',
                  'Fast loading (< 2 seconds)',
                  'Clean typography and spacing',
                  'Projects featured prominently',
                  'Contact links that actually work'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-400 text-center">
                    sarahchen.stackresume.com
                  </div>
                </div>
              </div>
              {/* Portfolio iframe */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <iframe
                  src="/api/examples/sarah-chen"
                  className="w-[200%] h-[200%] border-0 pointer-events-none"
                  style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
                  title="Example portfolio preview"
                  tabIndex={-1}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            One-time payment. No subscriptions. Choose the tier that fits your goals.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: 'Starter',
                price: 'RM129',
                description: 'Perfect for your first job search',
                features: [
                  'Up to 3 projects',
                  'yourname.stackresume.com',
                  'Developer template',
                  '24-hour delivery'
                ]
              },
              {
                name: 'Professional',
                price: 'RM229',
                description: 'Stand out from other candidates',
                features: [
                  'Unlimited projects',
                  'Custom domain',
                  'All templates',
                  'Basic analytics',
                  'Priority delivery'
                ],
                popular: true
              },
              {
                name: 'Flagship',
                price: 'RM499',
                description: 'White-glove service for competitive roles',
                features: [
                  'Everything in Professional',
                  'Manual design tweaks',
                  'Resume optimization',
                  'LinkedIn review',
                  'Direct support'
                ]
              }
            ].map((tier) => (
              <div 
                key={tier.name}
                className={`card text-left ${tier.popular ? 'border-slate-900 ring-1 ring-slate-900' : ''}`}
              >
                {tier.popular && (
                  <span className="inline-block bg-slate-900 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-3xl font-bold text-slate-900 mb-2">
                  {tier.price}
                </p>
                <p className="text-sm text-slate-600 mb-6">
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/pricing"
                  className={`btn w-full text-sm ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-slate-500">
            Need something different?{' '}
            <Link href="mailto:hello@stackresume.com" className="text-slate-900 underline">
              Contact us for institutional pricing
            </Link>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to upgrade your job search?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
            Join hundreds of technical students who have replaced their PDF resumes 
            with professional portfolio websites.
          </p>
          <Link 
            href="/pricing" 
            className="btn bg-white text-slate-900 hover:bg-slate-100 text-base"
          >
            Create My Portfolio
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
