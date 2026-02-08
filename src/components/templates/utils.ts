// Portfolio data type
export interface PortfolioData {
  student: {
    name: string
    subdomain: string
    custom_domain: string | null
  }
  profile: {
    role: string
    bio: string
    tech_stack: string[]
    skills: string[]
  }
  projects: Array<{
    title: string
    description: string
    tech_stack: string[]
    github_url: string
    live_url: string | null
  }>
  experience: Array<{
    organization: string
    role: string
    start_date: string
    end_date: string | null
    description: string
  }>
  socialLinks: {
    github: string | null
    linkedin: string | null
  }
  assets: {
    profile_photo_url: string | null
  }
}

// Generate SEO metadata
export function generateSEOMetadata(data: PortfolioData) {
  const title = `${data.student.name} - ${data.profile.role}`
  const description = data.profile.bio.substring(0, 160)
  const keywords = [
    data.profile.role,
    ...data.profile.tech_stack.slice(0, 5),
    'portfolio',
    'developer',
    'software engineer'
  ].join(', ')

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
    }
  }
}

// Format date range
export function formatDateRange(start: string, end: string | null): string {
  const startFormatted = new Date(start).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
  const endFormatted = end 
    ? new Date(end).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    : 'Present'
  return `${startFormatted} - ${endFormatted}`
}

// Truncate text to max lines
export function truncateText(text: string, maxLines: number = 5): string {
  const lines = text.split('\n')
  if (lines.length <= maxLines) return text
  return lines.slice(0, maxLines).join('\n') + '...'
}
