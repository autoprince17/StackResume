import { Card } from '@/components/ui/card'

const examplePortfolios = [
  {
    name: 'Sarah Chen',
    role: 'Developer',
    tier: 'Professional',
    description: 'Full-stack developer with React and Node.js experience',
    preview: 'Clean, minimal design with projects front and center'
  },
  {
    name: 'Marcus Johnson',
    role: 'Data Scientist',
    tier: 'Flagship',
    description: 'Machine learning engineer focused on NLP and recommendation systems',
    preview: 'Dark header with card-based project showcases'
  },
  {
    name: 'Emily Rodriguez',
    role: 'DevOps',
    tier: 'Professional',
    description: 'Cloud infrastructure specialist with AWS and Kubernetes expertise',
    preview: 'Terminal-inspired aesthetic with monospace fonts'
  }
]

export default function ExamplesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Example Portfolios
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Every portfolio we build follows recruiter optimization principles. 
            Clean, fast, and focused on your projects.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {examplePortfolios.map((example, index) => (
            <Card key={index} className="p-6">
              <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Portfolio Preview</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{example.name}</h3>
              <p className="text-sm text-slate-500 mb-2">{example.role} • {example.tier}</p>
              <p className="text-sm text-slate-600 mb-3">{example.description}</p>
              <p className="text-xs text-slate-500">{example.preview}</p>
            </Card>
          ))}
        </div>

        <div className="bg-slate-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            What makes a StackResume portfolio different?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Recruiter-optimized layout with projects featured first</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Fast loading (&lt; 2 seconds) with no bloat</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Mobile-responsive design that works everywhere</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>SEO optimized for your name and role</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>No placeholder text or generic templates</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
