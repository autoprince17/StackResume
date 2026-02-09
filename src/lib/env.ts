/**
 * Centralized environment variable validation.
 * 
 * Import the specific getter you need rather than accessing process.env directly.
 * Each getter throws a clear, actionable error if the variable is missing,
 * preventing cryptic runtime crashes deep in third-party SDK code.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local file or deployment environment settings.`
    )
  }
  return value
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim() !== '' ? value : undefined
}

// ---- Supabase ----
export function getSupabaseUrl(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_URL')
}

export function getSupabaseAnonKey(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function getSupabaseServiceRoleKey(): string {
  return requireEnv('SUPABASE_SERVICE_ROLE_KEY')
}

// ---- Stripe ----
export function getStripeSecretKey(): string {
  return requireEnv('STRIPE_SECRET_KEY')
}

export function getStripeWebhookSecret(): string {
  return requireEnv('STRIPE_WEBHOOK_SECRET')
}

// ---- Vercel ----
export function getVercelToken(): string {
  return requireEnv('VERCEL_TOKEN')
}

export function getVercelTeamId(): string | undefined {
  return optionalEnv('VERCEL_TEAM_ID')
}

// ---- Cron ----
export function getCronSecret(): string {
  return requireEnv('CRON_SECRET')
}

// ---- Email ----
export function getEmailProvider(): string {
  return optionalEnv('EMAIL_PROVIDER') || 'console'
}

export function getResendApiKey(): string | undefined {
  return optionalEnv('RESEND_API_KEY')
}

export function getEmailFrom(): string {
  return optionalEnv('EMAIL_FROM') || 'StackResume <hello@stackresume.com>'
}
