import { notFound } from 'next/navigation'
import { getStudentDetails, approveSubmission, rejectSubmission } from '@/lib/actions/admin'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Check, X, ExternalLink, AlertCircle } from 'lucide-react'

export default async function SubmissionDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const details = await getStudentDetails(params.id)

  if (!details) {
    notFound()
  }

  const { student, profile, projects, experience, socialLinks, assets, qualityCheck } = details

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/admin/submissions" 
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to submissions
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
          <p className="text-slate-600 mt-1">{student.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <form action={async () => {
            'use server'
            await rejectSubmission(params.id, 'Quality issues')
          }}>
            <button 
              type="submit"
              className="btn bg-red-100 text-red-700 hover:bg-red-200"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </button>
          </form>
          <form action={async () => {
            'use server'
            await approveSubmission(params.id)
          }}>
            <button 
              type="submit"
              className="btn btn-primary"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </button>
          </form>
        </div>
      </div>

      {/* Quality Check */}
      {!qualityCheck.valid && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Quality Issues Detected</h3>
              <ul className="space-y-1">
                {qualityCheck.errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-800">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="font-medium text-slate-900">{profile?.role}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Bio</p>
                <p className="text-slate-900 mt-1 leading-relaxed">{profile?.bio}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tech Stack</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile?.tech_stack?.map((tech: string) => (
                    <span 
                      key={tech} 
                      className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Projects */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Projects ({projects?.length || 0})
            </h2>
            <div className="space-y-6">
              {projects?.map((project, index) => (
                <div key={project.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{project.title}</h3>
                    <span className="text-xs text-slate-500">#{index + 1}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tech_stack?.map((tech: string) => (
                      <span 
                        key={tech} 
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <a 
                      href={project.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {project.live_url && (
                      <a 
                        href={project.live_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Live Demo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Experience */}
          {experience && experience.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Experience ({experience.length})
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{exp.role}</h3>
                        <p className="text-slate-600">{exp.organization}</p>
                      </div>
                      <p className="text-sm text-slate-500">
                        {exp.start_date} - {exp.end_date || 'Present'}
                      </p>
                    </div>
                    <p className="text-slate-600 text-sm mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tier Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Tier Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Selected Tier</p>
                <p className="font-medium text-slate-900 capitalize">{student.tier}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-medium text-slate-900 capitalize">{student.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Submitted</p>
                <p className="font-medium text-slate-900">
                  {new Date(student.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Assets */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Assets</h3>
            <div className="space-y-3">
              {assets?.profile_photo_url && (
                <div>
                  <p className="text-sm text-slate-500">Profile Photo</p>
                  <a 
                    href={assets.profile_photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View Photo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {assets?.resume_url && (
                <div>
                  <p className="text-sm text-slate-500">Resume</p>
                  <a 
                    href={assets.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View Resume
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Links</h3>
            <div className="space-y-2">
              {socialLinks?.github && (
                <a 
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {socialLinks?.linkedin && (
                <a 
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
