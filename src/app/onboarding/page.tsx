'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Code, 
  Briefcase, 
  GraduationCap, 
  Link, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react'
import { submitOnboardingForm } from '@/lib/actions/student'
import { getTierLimits } from '@/lib/tiers'

const techOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++',
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
  'AWS', 'Docker', 'Kubernetes', 'Terraform',
  'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'Git', 'Linux', 'GraphQL', 'REST'
]

type FormData = {
  personalInfo: {
    name: string
    email: string
    bio: string
    profilePhoto: File | null
  }
  technicalProfile: {
    role: 'Developer' | 'Data Scientist' | 'DevOps' | ''
    techStack: string[]
    skills: string[]
  }
  projects: Array<{
    title: string
    description: string
    techStack: string[]
    githubUrl: string
    liveUrl: string
  }>
  experience: Array<{
    organization: string
    role: string
    startDate: string
    endDate: string
    description: string
  }>
  socialLinks: {
    github: string
    linkedin: string
    existingPortfolio: string
  }
  resume: File | null
}

const initialFormData: FormData = {
  personalInfo: {
    name: '',
    email: '',
    bio: '',
    profilePhoto: null
  },
  technicalProfile: {
    role: '',
    techStack: [],
    skills: []
  },
  projects: [{
    title: '',
    description: '',
    techStack: [],
    githubUrl: '',
    liveUrl: ''
  }],
  experience: [],
  socialLinks: {
    github: '',
    linkedin: '',
    existingPortfolio: ''
  },
  resume: null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [tier, setTier] = useState<'starter' | 'professional' | 'flagship'>('starter')
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Verify payment and get tier
    const storedTier = sessionStorage.getItem('selectedTier')
    const storedPaymentIntentId = sessionStorage.getItem('paymentIntentId')

    if (!storedTier || !storedPaymentIntentId) {
      router.push('/pricing')
      return
    }

    setTier(storedTier as typeof tier)
    setPaymentIntentId(storedPaymentIntentId)
  }, [router])

  const updateFormData = useCallback((section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
    // Clear errors when user updates
    setErrors({})
  }, [])

  const addProject = () => {
    const tierLimits = getTierLimits(tier)
    const maxProjects = tierLimits.maxProjects === Infinity ? 10 : tierLimits.maxProjects
    
    if (formData.projects.length >= maxProjects) {
      setErrors({ projects: `Maximum ${maxProjects} projects allowed for ${tier} tier` })
      return
    }

    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        title: '',
        description: '',
        techStack: [],
        githubUrl: '',
        liveUrl: ''
      }]
    }))
  }

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const updateProject = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }))
  }

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        organization: '',
        role: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }))
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((e, i) => 
        i === index ? { ...e, [field]: value } : e
      )
    }))
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 0: // Personal Info
        if (!formData.personalInfo.name.trim()) {
          newErrors.name = 'Name is required'
        }
        if (!formData.personalInfo.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
          newErrors.email = 'Invalid email address'
        }
        if (formData.personalInfo.bio.trim().split(/\s+/).length < 40) {
          newErrors.bio = 'Bio must be at least 40 words'
        }
        break

      case 1: // Technical Profile
        if (!formData.technicalProfile.role) {
          newErrors.role = 'Please select a role'
        }
        if (formData.technicalProfile.techStack.length === 0) {
          newErrors.techStack = 'Select at least one technology'
        }
        break

      case 2: // Projects
        if (formData.projects.length === 0) {
          newErrors.projects = 'At least one project is required'
        } else {
          formData.projects.forEach((project, index) => {
            if (!project.title.trim()) {
              newErrors[`project_${index}_title`] = 'Project name required'
            }
            if (!project.description.trim()) {
              newErrors[`project_${index}_description`] = 'Description required'
            }
            if (!project.githubUrl.trim()) {
              newErrors[`project_${index}_github`] = 'GitHub URL required'
            }
          })
        }
        break

      case 3: // Experience - optional, so no validation
        break

      case 4: // Social Links - optional, but validate URLs if provided
        if (formData.socialLinks.github && !formData.socialLinks.github.includes('github.com')) {
          newErrors.github = 'Must be a valid GitHub URL'
        }
        if (formData.socialLinks.linkedin && !formData.socialLinks.linkedin.includes('linkedin.com')) {
          newErrors.linkedin = 'Must be a valid LinkedIn URL'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep() || !paymentIntentId) return

    setIsSubmitting(true)

    try {
      const result = await submitOnboardingForm(
        {
          personalInfo: {
            name: formData.personalInfo.name,
            email: formData.personalInfo.email,
            bio: formData.personalInfo.bio,
          },
          technicalProfile: {
            role: formData.technicalProfile.role as 'Developer' | 'Data Scientist' | 'DevOps',
            techStack: formData.technicalProfile.techStack,
            skills: formData.technicalProfile.skills,
          },
          projects: formData.projects,
          experience: formData.experience,
          socialLinks: formData.socialLinks,
        },
        tier,
        paymentIntentId,
        {
          profilePhoto: formData.personalInfo.profilePhoto || undefined,
          resume: formData.resume || undefined,
        }
      )

      if (result.success) {
        // Clear session storage
        sessionStorage.removeItem('paymentIntentId')
        sessionStorage.removeItem('selectedTier')
        // Redirect to success page
        router.push('/success?studentId=' + result.studentId)
      } else {
        setErrors({ submit: result.error || 'Submission failed' })
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { icon: User, title: 'Personal Info' },
    { icon: Code, title: 'Technical Profile' },
    { icon: Briefcase, title: 'Projects' },
    { icon: GraduationCap, title: 'Experience' },
    { icon: Link, title: 'Social Links' },
    { icon: FileText, title: 'Resume' },
  ]

  const StepIcon = steps[currentStep].icon

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Create Your Portfolio
          </h1>
          <p className="text-slate-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 ${
                    index < currentStep ? 'bg-slate-900' : 'bg-slate-200'
                  }`}
                  style={{ minWidth: '30px' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {currentStep === 0 && (
            <PersonalInfoStep 
              data={formData.personalInfo}
              onChange={(data) => updateFormData('personalInfo', data)}
              errors={errors}
            />
          )}

          {currentStep === 1 && (
            <TechnicalProfileStep
              data={formData.technicalProfile}
              onChange={(data) => updateFormData('technicalProfile', data)}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <ProjectsStep
              projects={formData.projects}
              onAdd={addProject}
              onRemove={removeProject}
              onUpdate={updateProject}
              tier={tier}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <ExperienceStep
              experience={formData.experience}
              onAdd={addExperience}
              onRemove={removeExperience}
              onUpdate={updateExperience}
            />
          )}

          {currentStep === 4 && (
            <SocialLinksStep
              data={formData.socialLinks}
              onChange={(data) => updateFormData('socialLinks', data)}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <ResumeStep
              file={formData.resume}
              onChange={(file) => updateFormData('resume', file)}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-8 border-t border-slate-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Portfolio'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Your information is secure and will only be used to build your portfolio.
        </p>
      </div>
    </div>
  )
}

// Step Components

function PersonalInfoStep({ 
  data, 
  onChange, 
  errors 
}: { 
  data: FormData['personalInfo']
  onChange: (data: FormData['personalInfo']) => void
  errors: Record<string, string>
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="label">Full Name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="input"
          placeholder="John Doe"
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="label">Email Address</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="input"
          placeholder="john@example.com"
        />
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="label">Bio</label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ ...data, bio: e.target.value })}
          className="input min-h-[150px]"
          placeholder="Tell us about yourself, your background, and what you are looking for..."
        />
        <div className="flex justify-between mt-2">
          <p className="text-sm text-slate-500">
            Minimum 40 words. Be specific about your role and expertise.
          </p>
          <p className="text-sm text-slate-500">
            {data.bio.trim().split(/\s+/).filter(w => w.length > 0).length} words
          </p>
        </div>
        {errors.bio && <p className="mt-2 text-sm text-red-600">{errors.bio}</p>}
      </div>

      <div>
        <label className="label">Profile Photo (Optional)</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
            <Upload className="w-5 h-5 text-slate-600" />
            <span className="text-sm text-slate-700">
              {data.profilePhoto ? data.profilePhoto.name : 'Choose file'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onChange({ ...data, profilePhoto: e.target.files?.[0] || null })}
              className="hidden"
            />
          </label>
          {data.profilePhoto && (
            <button
              onClick={() => onChange({ ...data, profilePhoto: null })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TechnicalProfileStep({
  data,
  onChange,
  errors
}: {
  data: FormData['technicalProfile']
  onChange: (data: FormData['technicalProfile']) => void
  errors: Record<string, string>
}) {
  const toggleTech = (tech: string) => {
    const newStack = data.techStack.includes(tech)
      ? data.techStack.filter(t => t !== tech)
      : [...data.techStack, tech]
    onChange({ ...data, techStack: newStack })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Primary Role</label>
        <div className="grid grid-cols-3 gap-4">
          {['Developer', 'Data Scientist', 'DevOps'].map((role) => (
            <button
              key={role}
              onClick={() => onChange({ ...data, role: role as any })}
              className={`p-4 border rounded-lg text-center transition-colors ${
                data.role === role
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-medium text-slate-900">{role}</p>
            </button>
          ))}
        </div>
        {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
      </div>

      <div>
        <label className="label">Tech Stack</label>
        <p className="text-sm text-slate-500 mb-3">Select the technologies you work with:</p>
        <div className="flex flex-wrap gap-2">
          {techOptions.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                data.techStack.includes(tech)
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
        {errors.techStack && <p className="mt-2 text-sm text-red-600">{errors.techStack}</p>}
      </div>

      <div>
        <label className="label">Skills (Optional)</label>
        <input
          type="text"
          value={data.skills.join(', ')}
          onChange={(e) => onChange({ 
            ...data, 
            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="input"
          placeholder="e.g., Leadership, Communication, Problem Solving"
        />
        <p className="mt-2 text-sm text-slate-500">
          Separate skills with commas
        </p>
      </div>
    </div>
  )
}

function ProjectsStep({
  projects,
  onAdd,
  onRemove,
  onUpdate,
  tier,
  errors
}: {
  projects: FormData['projects']
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: string, value: any) => void
  tier: 'starter' | 'professional' | 'flagship'
  errors: Record<string, string>
}) {
  const tierLimits = { starter: 3, professional: Infinity, flagship: Infinity }
  const maxProjects = tierLimits[tier]
  const canAddMore = maxProjects === Infinity || projects.length < maxProjects

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
          <p className="text-sm text-slate-500">
            {tier === 'starter' ? `Maximum ${maxProjects} projects for Starter tier` : 'Add as many projects as you like'}
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={!canAddMore}
          className="btn btn-secondary text-sm disabled:opacity-50"
        >
          + Add Project
        </button>
      </div>

      {errors.projects && (
        <p className="text-sm text-red-600">{errors.projects}</p>
      )}

      {projects.map((project, index) => (
        <div key={index} className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">Project {index + 1}</h4>
            {projects.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="label text-sm">Project Name</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => onUpdate(index, 'title', e.target.value)}
                className="input"
                placeholder="e.g., E-commerce Platform"
              />
              {errors[`project_${index}_title`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`project_${index}_title`]}</p>
              )}
            </div>

            <div>
              <label className="label text-sm">Description</label>
              <textarea
                value={project.description}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className="input min-h-[100px]"
                placeholder="Describe the problem you solved, technologies used, and outcomes..."
              />
              {errors[`project_${index}_description`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`project_${index}_description`]}</p>
              )}
            </div>

            <div>
              <label className="label text-sm">Technologies Used</label>
              <input
                type="text"
                value={project.techStack.join(', ')}
                onChange={(e) => onUpdate(index, 'techStack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="input"
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-sm">GitHub URL</label>
                <input
                  type="url"
                  value={project.githubUrl}
                  onChange={(e) => onUpdate(index, 'githubUrl', e.target.value)}
                  className="input"
                  placeholder="https://github.com/..."
                />
                {errors[`project_${index}_github`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`project_${index}_github`]}</p>
                )}
              </div>
              <div>
                <label className="label text-sm">Live Demo (Optional)</label>
                <input
                  type="url"
                  value={project.liveUrl}
                  onChange={(e) => onUpdate(index, 'liveUrl', e.target.value)}
                  className="input"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExperienceStep({
  experience,
  onAdd,
  onRemove,
  onUpdate
}: {
  experience: FormData['experience']
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: string, value: string) => void
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Work & Education</h3>
          <p className="text-sm text-slate-500">
            Add internships, jobs, or relevant education (optional)
          </p>
        </div>
        <button
          onClick={onAdd}
          className="btn btn-secondary text-sm"
        >
          + Add Experience
        </button>
      </div>

      {experience.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500">No experience added yet</p>
          <button
            onClick={onAdd}
            className="text-slate-900 font-medium hover:underline mt-2"
          >
            Add your first experience
          </button>
        </div>
      )}

      {experience.map((exp, index) => (
        <div key={index} className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">Experience {index + 1}</h4>
            <button
              onClick={() => onRemove(index)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label text-sm">Organization</label>
              <input
                type="text"
                value={exp.organization}
                onChange={(e) => onUpdate(index, 'organization', e.target.value)}
                className="input"
                placeholder="Company or School Name"
              />
            </div>

            <div>
              <label className="label text-sm">Role / Degree</label>
              <input
                type="text"
                value={exp.role}
                onChange={(e) => onUpdate(index, 'role', e.target.value)}
                className="input"
                placeholder="e.g., Software Engineering Intern"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-sm">Start Date</label>
                <input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label text-sm">End Date</label>
                <input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
                  className="input"
                  placeholder="Present"
                />
              </div>
            </div>

            <div>
              <label className="label text-sm">Description</label>
              <textarea
                value={exp.description}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SocialLinksStep({
  data,
  onChange,
  errors
}: {
  data: FormData['socialLinks']
  onChange: (data: FormData['socialLinks']) => void
  errors: Record<string, string>
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-slate-600 mb-6">
          Add links to your professional profiles. These help recruiters learn more about you.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">GitHub Profile</label>
            <input
              type="url"
              value={data.github}
              onChange={(e) => onChange({ ...data, github: e.target.value })}
              className="input"
              placeholder="https://github.com/yourusername"
            />
            {errors.github && <p className="mt-2 text-sm text-red-600">{errors.github}</p>}
          </div>

          <div>
            <label className="label">LinkedIn Profile</label>
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
              className="input"
              placeholder="https://linkedin.com/in/yourusername"
            />
            {errors.linkedin && <p className="mt-2 text-sm text-red-600">{errors.linkedin}</p>}
          </div>

          <div>
            <label className="label">Existing Portfolio (Optional)</label>
            <input
              type="url"
              value={data.existingPortfolio}
              onChange={(e) => onChange({ ...data, existingPortfolio: e.target.value })}
              className="input"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ResumeStep({
  file,
  onChange
}: {
  file: File | null
  onChange: (file: File | null) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="label">Upload Your Resume (Optional)</label>
        <p className="text-sm text-slate-600 mb-4">
          We use AI to extract information from your resume to pre-fill your portfolio. 
          You will have a chance to review and edit everything before submitting.
        </p>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          
          {file ? (
            <div>
              <p className="text-slate-900 font-medium mb-2">{file.name}</p>
              <div className="flex justify-center gap-4">
                <label className="text-slate-900 font-medium hover:underline cursor-pointer">
                  Change file
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => onChange(null)}
                  className="text-red-600 font-medium hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="cursor-pointer">
                <span className="text-slate-900 font-medium hover:underline">
                  Click to upload
                </span>
                <span className="text-slate-500"> or drag and drop</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-slate-500 mt-2">
                PDF, DOCX up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can skip this step and fill out the form manually. 
          Resume parsing helps speed up the process but is not required.
        </p>
      </div>
    </div>
  )
}
