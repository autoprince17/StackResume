/**
 * Email notification helper for StackResume
 * 
 * This module provides a provider-agnostic email interface.
 * Configure your preferred email service by setting EMAIL_PROVIDER env var:
 * - 'resend': Use Resend (recommended, set RESEND_API_KEY)
 * - 'console': Log to console (development/testing)
 * 
 * To add more providers (SendGrid, Nodemailer, etc.), add a new case to sendEmail().
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailResult {
  success: boolean
  error?: string
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'StackResume <hello@stackresume.com>'

async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || 'console'

  try {
    switch (provider) {
      case 'resend': {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
          console.warn('RESEND_API_KEY not set, falling back to console')
          console.log(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`)
          return { success: true }
        }

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(`Resend API error: ${res.status} ${JSON.stringify(errorData)}`)
        }

        return { success: true }
      }

      case 'console':
      default: {
        console.log(`[EMAIL] To: ${options.to}`)
        console.log(`[EMAIL] Subject: ${options.subject}`)
        console.log(`[EMAIL] Body: ${options.text || options.html.substring(0, 200)}...`)
        return { success: true }
      }
    }
  } catch (error) {
    console.error('Email send failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    }
  }
}

// ---- Notification templates ----

export async function sendSubmissionReceived(email: string, name: string): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: 'We received your portfolio submission — StackResume',
    html: `
      <h2>Thanks for submitting, ${name}!</h2>
      <p>We have received your portfolio content and it is now in our review queue.</p>
      <p>Here is what happens next:</p>
      <ol>
        <li>We review your submission for quality and completeness</li>
        <li>We build your portfolio using our templates</li>
        <li>We deploy it and send you the live URL</li>
      </ol>
      <p>Most portfolios are live within 24 hours. You can check your status at any time on your <a href="https://stackresume.com/dashboard">dashboard</a>.</p>
      <p>— The StackResume Team</p>
    `,
    text: `Thanks for submitting, ${name}! We have received your portfolio content and it is now in our review queue. Most portfolios are live within 24 hours.`,
  })
}

export async function sendSubmissionApproved(email: string, name: string): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: 'Your portfolio has been approved — StackResume',
    html: `
      <h2>Great news, ${name}!</h2>
      <p>Your portfolio submission has been approved and is now being built.</p>
      <p>We will email you again once your portfolio is live with your URL.</p>
      <p>— The StackResume Team</p>
    `,
    text: `Great news, ${name}! Your portfolio submission has been approved and is now being built. We will email you once it is live.`,
  })
}

export async function sendPortfolioDeployed(
  email: string, 
  name: string, 
  subdomain: string,
  customDomain?: string | null
): Promise<EmailResult> {
  const primaryUrl = customDomain || `${subdomain}.stackresume.com`
  
  return sendEmail({
    to: email,
    subject: 'Your portfolio is LIVE — StackResume',
    html: `
      <h2>Your portfolio is live, ${name}!</h2>
      <p>Your portfolio has been deployed and is ready to share:</p>
      <p><a href="https://${primaryUrl}" style="font-size: 18px; font-weight: bold;">https://${primaryUrl}</a></p>
      <p>Add this link to your resume, LinkedIn, and job applications.</p>
      <p>Need to make changes? Visit your <a href="https://stackresume.com/dashboard">dashboard</a> to submit a change request.</p>
      <p>— The StackResume Team</p>
    `,
    text: `Your portfolio is live, ${name}! Visit it at: https://${primaryUrl}. Add this link to your resume, LinkedIn, and job applications.`,
  })
}

export async function sendSubmissionRejected(
  email: string, 
  name: string, 
  reason: string,
  refunded: boolean
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: 'Update on your portfolio submission — StackResume',
    html: `
      <h2>Hi ${name},</h2>
      <p>Unfortunately, we were unable to proceed with your portfolio submission.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      ${refunded ? '<p>A full refund has been issued to your original payment method. It may take 5-10 business days to appear.</p>' : ''}
      <p>You can check the details and status on your <a href="https://stackresume.com/dashboard">dashboard</a>.</p>
      <p>If you have questions, reply to this email or contact us at hello@stackresume.com.</p>
      <p>— The StackResume Team</p>
    `,
    text: `Hi ${name}, unfortunately we were unable to proceed with your portfolio submission. Reason: ${reason}. ${refunded ? 'A full refund has been issued.' : ''} Check your dashboard at https://stackresume.com/dashboard for details. Contact hello@stackresume.com for questions.`,
  })
}

export async function sendEditsRequested(
  email: string, 
  name: string, 
  editRequests: string[]
): Promise<EmailResult> {
  const editList = editRequests.map(r => `<li>${r}</li>`).join('')
  
  return sendEmail({
    to: email,
    subject: 'Edits requested for your portfolio — StackResume',
    html: `
      <h2>Hi ${name},</h2>
      <p>We have reviewed your submission and would like to request some changes before we build your portfolio:</p>
      <ul>${editList}</ul>
      <p>Please visit your <a href="https://stackresume.com/dashboard">dashboard</a> to update your submission.</p>
      <p>— The StackResume Team</p>
    `,
    text: `Hi ${name}, we have reviewed your submission and would like to request some changes: ${editRequests.join('; ')}. Please visit your dashboard to update your submission.`,
  })
}

export async function sendRefundNotification(
  email: string,
  name: string
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: 'Refund processed for your StackResume payment',
    html: `
      <h2>Hi ${name},</h2>
      <p>A refund has been processed for your StackResume payment.</p>
      <p>The refund should appear on your original payment method within 5-10 business days.</p>
      <p>You can check the details on your <a href="https://stackresume.com/dashboard">dashboard</a>.</p>
      <p>If you have questions, reply to this email or contact us at hello@stackresume.com.</p>
      <p>— The StackResume Team</p>
    `,
    text: `Hi ${name}, a refund has been processed for your StackResume payment. It should appear within 5-10 business days. Check your dashboard at https://stackresume.com/dashboard for details. Contact hello@stackresume.com for questions.`,
  })
}
