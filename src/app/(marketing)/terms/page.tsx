export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-12">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Service Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              StackResume provides a portfolio-building service for students. Upon payment, you submit 
              your portfolio content through our onboarding form. We review, build, and deploy your 
              portfolio website. The service is a one-time purchase that includes lifetime hosting on 
              a stackresume.com subdomain.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Payment and Pricing</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>All prices are in Malaysian Ringgit (MYR) and are one-time payments</li>
              <li>Payment is processed securely through Stripe</li>
              <li>You must pay before submitting your portfolio content</li>
              <li>Prices may change at any time, but your purchase is locked at the price you paid</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Delivery</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We aim to deliver your portfolio within the following timeframes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Starter:</strong> Within 24 hours</li>
              <li><strong>Professional:</strong> Within 12 hours (priority)</li>
              <li><strong>Flagship:</strong> Same-day when possible</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              These are target timeframes, not guarantees. Delivery may take longer during high-volume 
              periods or if your submission requires additional review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Refund Policy</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We offer refunds under the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>If we are unable to deliver your portfolio within 7 days of submission</li>
              <li>If your submission is rejected during review (full refund)</li>
              <li>If the delivered portfolio has significant defects that cannot be resolved through revisions</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Refund requests must be made within 7 days of portfolio delivery. Refunds are not available 
              for change of mind after your portfolio has been deployed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Content Responsibility</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              You are responsible for ensuring that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>All content you submit is accurate and truthful</li>
              <li>You have the right to use any images or files you upload</li>
              <li>Your content does not infringe on any third-party intellectual property rights</li>
              <li>Your content does not contain illegal, harmful, or offensive material</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              We reserve the right to reject submissions that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Changes and Edits</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              All tiers include content edits such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Fixing typos and broken links</li>
              <li>Updating job titles and descriptions</li>
              <li>Adding or removing projects</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Major changes such as template swaps and full redesigns may incur additional fees depending 
              on your tier. Flagship tier customers receive priority support for all change types.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Hosting</h2>
            <p className="text-slate-600 leading-relaxed">
              Your portfolio is hosted on Vercel&apos;s infrastructure. We provide lifetime hosting on a 
              stackresume.com subdomain at no additional cost. Custom domains (Professional and Flagship 
              tiers) require you to own and configure the domain. We do not guarantee 100% uptime but will 
              make reasonable efforts to keep your portfolio accessible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              StackResume is provided &quot;as is&quot; without warranty of any kind. We are not liable 
              for any indirect, incidental, or consequential damages arising from your use of the service. 
              Our total liability is limited to the amount you paid for the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Termination</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to remove portfolios that violate these terms. You may request 
              removal of your portfolio at any time by contacting{' '}
              <a href="mailto:hello@stackresume.com" className="text-slate-900 underline">
                hello@stackresume.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions about these terms, contact us at{' '}
              <a href="mailto:hello@stackresume.com" className="text-slate-900 underline">
                hello@stackresume.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
