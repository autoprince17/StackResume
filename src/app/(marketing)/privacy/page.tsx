export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-12">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              When you use StackResume, we collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Account information:</strong> Name, email address</li>
              <li><strong>Portfolio content:</strong> Bio, projects, experience, skills, social links, and any files you upload (profile photo, resume)</li>
              <li><strong>Payment information:</strong> Processed securely through Stripe. We never store your card details directly.</li>
              <li><strong>Usage data:</strong> Page views, referrer URLs, and device types for portfolio analytics (Professional and Flagship tiers only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Build and deploy your portfolio website</li>
              <li>Process payments through Stripe</li>
              <li>Communicate with you about your portfolio status</li>
              <li>Provide analytics on your portfolio performance (if included in your tier)</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Data Storage and Security</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Your data is stored securely using Supabase (hosted on AWS). Files are stored in Supabase Storage 
              with appropriate access controls. Your portfolio is deployed on Vercel&apos;s global edge network.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Payment processing is handled entirely by Stripe. We only store your Stripe payment intent ID 
              and customer ID for reference — never your card number, CVV, or other sensitive payment details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Third-Party Services</h2>
            <p className="text-slate-600 leading-relaxed mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Supabase:</strong> Database, authentication, and file storage</li>
              <li><strong>Vercel:</strong> Portfolio hosting and deployment</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Each of these services has their own privacy policy governing how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data and portfolio</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:hello@stackresume.com" className="text-slate-900 underline">
                hello@stackresume.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              Your portfolio content and account data are retained for as long as your portfolio is active. 
              If you request deletion, we will remove your data within 30 days. Payment records may be 
              retained longer as required by financial regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about this privacy policy, contact us at{' '}
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
