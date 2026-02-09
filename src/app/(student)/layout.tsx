import Link from 'next/link'
import { signOut } from '@/lib/auth'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">
            StackResume
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="container-narrow py-8">
        {children}
      </main>
    </div>
  )
}
