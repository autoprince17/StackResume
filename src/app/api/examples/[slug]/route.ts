import { NextRequest, NextResponse } from 'next/server'
import { getExampleBySlug } from '@/lib/example-data'
import { generatePortfolioHTML } from '@/components/templates'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const example = getExampleBySlug(slug)
  if (!example) {
    return NextResponse.json({ error: 'Example not found' }, { status: 404 })
  }

  const html = generatePortfolioHTML(example.templateType, example.data)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
