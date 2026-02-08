import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getExampleBySlug, examplePortfolios } from '@/lib/example-data'

export function generateStaticParams() {
  return examplePortfolios.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const example = getExampleBySlug(slug)
  if (!example) return { title: 'Example Not Found' }
  return {
    title: `${example.name} — ${example.role} Portfolio | StackResume`,
    description: example.description,
  }
}

export default async function ExampleViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const example = getExampleBySlug(slug)

  if (!example) {
    notFound()
  }

  return (
    <div className="py-8">
      <div className="container-wide">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/examples"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Examples
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{example.name}</h1>
              <p className="text-sm text-slate-500">
                {example.role} &middot; {example.tier} Tier &middot; {example.templateType} template
              </p>
            </div>
          </div>
          <a
            href={`/api/examples/${example.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Full Screen
          </a>
        </div>

        {/* Portfolio iframe */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-400 text-center">
                {example.data.student.subdomain}.stackresume.com
              </div>
            </div>
          </div>
          <iframe
            src={`/api/examples/${example.slug}`}
            className="w-full border-0"
            style={{ height: '80vh' }}
            title={`${example.name} portfolio preview`}
          />
        </div>
      </div>
    </div>
  )
}
