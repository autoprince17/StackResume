import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { examplePortfolios } from '@/lib/example-data'

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
          {examplePortfolios.map((example) => (
            <Link key={example.slug} href={`/examples/${example.slug}`} className="group">
              <Card className="p-0 overflow-hidden transition-shadow hover:shadow-md">
                {/* Iframe thumbnail */}
                <div className="aspect-video relative overflow-hidden bg-slate-50 border-b border-slate-200">
                  <iframe
                    src={`/api/examples/${example.slug}`}
                    className="w-[200%] h-[200%] border-0 pointer-events-none"
                    style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
                    title={`${example.name} portfolio preview`}
                    tabIndex={-1}
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {example.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">
                    {example.role} &middot; {example.tier}
                  </p>
                  <p className="text-sm text-slate-600 mb-3">{example.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                    View Portfolio
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="bg-slate-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            What makes a StackResume portfolio different?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>Recruiter-optimized layout with projects featured first</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>Fast loading (&lt; 2 seconds) with no bloat</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>Mobile-responsive design that works everywhere</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>SEO optimized for your name and role</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold">&#10003;</span>
              <span>No placeholder text or generic templates</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
