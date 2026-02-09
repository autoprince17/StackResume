import { z } from 'zod'

export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(5000, 'Bio is too long').refine(
    (val) => val.trim().split(/\s+/).filter(w => w.length > 0).length >= 40,
    'Bio must be at least 40 words'
  ),
  profilePhoto: z.instanceof(File).optional()
})

export const technicalProfileSchema = z.object({
  role: z.enum(['Developer', 'Data Scientist', 'DevOps']),
  techStack: z.array(z.string()).min(1, 'Select at least one technology'),
  skills: z.array(z.string()).default([])
})

export const projectSchema = z.object({
  title: z.string().min(2, 'Project name required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  techStack: z.array(z.string()).min(1, 'List at least one technology'),
  githubUrl: z.string().url('Valid GitHub URL required').startsWith('https://github.com/'),
  liveUrl: z.string().url().optional().or(z.literal(''))
})

export const experienceSchema = z.object({
  organization: z.string().min(1, 'Organization required'),
  role: z.string().min(1, 'Role required'),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Use format YYYY-MM'),
  endDate: z.string().regex(/^\d{4}-\d{2}$/).optional().or(z.literal('')),
  description: z.string().min(20, 'Description required')
})

export const socialLinksSchema = z.object({
  github: z.string().url().startsWith('https://github.com/').optional().or(z.literal('')),
  linkedin: z.string().url().refine(
    (val) => val.startsWith('https://linkedin.com/in/') || val.startsWith('https://www.linkedin.com/in/'),
    'Must start with https://linkedin.com/in/ or https://www.linkedin.com/in/'
  ).optional().or(z.literal('')),
  existingPortfolio: z.string().url().optional().or(z.literal(''))
})

export const onboardingFormSchema = z.object({
  personalInfo: personalInfoSchema,
  technicalProfile: technicalProfileSchema,
  projects: z.array(projectSchema).min(1, 'At least one project required'),
  experience: z.array(experienceSchema),
  socialLinks: socialLinksSchema,
  resume: z.instanceof(File).optional()
})

// Admin validation for minimum approval standards
export function validateSubmissionQuality(data: {
  bio: string
  projects: Array<{ description: string; tech_stack?: string[]; techStack?: string[] }>
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Bio must be role-specific and substantial
  const bioWordCount = data.bio.trim().split(/\s+/).length
  if (bioWordCount < 40) {
    errors.push(`Bio too short (${bioWordCount} words, min 40)`)
  }

  // Check for placeholder text patterns
  const placeholderPatterns = [
    /lorem ipsum/i,
    /placeholder/i,
    /test/i,
    /xxx/i,
    /sample/i
  ]

  if (placeholderPatterns.some(pattern => pattern.test(data.bio))) {
    errors.push('Bio contains placeholder text')
  }

  // Project quality checks
  if (data.projects.length === 0) {
    errors.push('At least one project required')
  } else {
    data.projects.forEach((project, index) => {
      const descWordCount = (project.description || '').trim().split(/\s+/).length
      if (descWordCount < 20) {
        errors.push(`Project ${index + 1}: Description too short`)
      }
      
      // Accept both snake_case (from DB) and camelCase field names
      const techStack = project.tech_stack || project.techStack || []
      if (techStack.length === 0) {
        errors.push(`Project ${index + 1}: No technologies listed`)
      }

      // Check for outcome/learning indicators
      const outcomePatterns = [
        /improved/i,
        /increased/i,
        /reduced/i,
        /learned/i,
        /result/i,
        /outcome/i,
        /impact/i
      ]
      
      if (!outcomePatterns.some(pattern => pattern.test(project.description || ''))) {
        errors.push(`Project ${index + 1}: Add outcome or learning`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type TechnicalProfile = z.infer<typeof technicalProfileSchema>
export type Project = z.infer<typeof projectSchema>
export type Experience = z.infer<typeof experienceSchema>
export type SocialLinks = z.infer<typeof socialLinksSchema>
export type OnboardingFormData = z.infer<typeof onboardingFormSchema>

// Server-side validation schema (no File fields)
export const serverOnboardingFormSchema = z.object({
  personalInfo: personalInfoSchema.omit({ profilePhoto: true }),
  technicalProfile: technicalProfileSchema,
  projects: z.array(projectSchema).min(1, 'At least one project required'),
  experience: z.array(experienceSchema),
  socialLinks: socialLinksSchema,
})

// ── Lightweight runtime validators ──────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Returns true if `value` is a valid UUID v4 string */
export function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns true if `value` looks like a valid email address */
export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value)
}
