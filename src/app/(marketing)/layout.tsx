import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            StackResume
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/examples" className="text-sm text-slate-600 hover:text-slate-900">
              Examples
            </Link>
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link 
              href="/pricing" 
              className="btn btn-primary text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="container-wide py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} StackResume. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
