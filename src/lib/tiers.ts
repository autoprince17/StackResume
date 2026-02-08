import { Database } from '@/types/supabase'

type Tier = 'starter' | 'professional' | 'flagship'

interface TierLimits {
  maxProjects: number
  customDomainAllowed: boolean
  analyticsAllowed: boolean
  templates: string[]
}

export const TIER_CONFIG: Record<Tier, TierLimits> = {
  starter: {
    maxProjects: 3,
    customDomainAllowed: false,
    analyticsAllowed: false,
    templates: ['developer']
  },
  professional: {
    maxProjects: Infinity,
    customDomainAllowed: true,
    analyticsAllowed: true,
    templates: ['developer', 'data-scientist', 'devops']
  },
  flagship: {
    maxProjects: Infinity,
    customDomainAllowed: true,
    analyticsAllowed: true,
    templates: ['developer', 'data-scientist', 'devops']
  }
}

export const TIER_PRICES: Record<Tier, number> = {
  starter: 12900, // cents
  professional: 22900,
  flagship: 49900
}

export function getTierLimits(tier: Tier): TierLimits {
  return TIER_CONFIG[tier]
}

export function validateProjectCount(tier: Tier, currentCount: number): boolean {
  const limits = TIER_CONFIG[tier]
  return currentCount <= limits.maxProjects
}

export function canUseCustomDomain(tier: Tier): boolean {
  return TIER_CONFIG[tier].customDomainAllowed
}

export function canAccessAnalytics(tier: Tier): boolean {
  return TIER_CONFIG[tier].analyticsAllowed
}

export function isTemplateAllowed(tier: Tier, template: string): boolean {
  return TIER_CONFIG[tier].templates.includes(template)
}

export function getRemainingProjects(tier: Tier, currentCount: number): number {
  const limits = TIER_CONFIG[tier]
  if (limits.maxProjects === Infinity) return Infinity
  return Math.max(0, limits.maxProjects - currentCount)
}

export function enforceTierLimits(
  tier: Tier,
  data: {
    projectCount: number
    customDomain?: string | null
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const limits = TIER_CONFIG[tier]

  // Check project count
  if (data.projectCount > limits.maxProjects) {
    const maxText = limits.maxProjects === Infinity ? 'unlimited' : limits.maxProjects
    errors.push(`Maximum ${maxText} projects allowed for ${tier} tier`)
  }

  // Check custom domain
  if (data.customDomain && !limits.customDomainAllowed) {
    errors.push('Custom domains not available for this tier')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function createTierSnapshot(tier: Tier): {
  tier: string
  max_projects: number
  custom_domain_allowed: boolean
  analytics_allowed: boolean
} {
  const limits = TIER_CONFIG[tier]
  return {
    tier,
    max_projects: limits.maxProjects === Infinity ? 999 : limits.maxProjects,
    custom_domain_allowed: limits.customDomainAllowed,
    analytics_allowed: limits.analyticsAllowed
  }
}
