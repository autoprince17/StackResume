import Link from 'next/link'
import { signOut } from '@/lib/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold">
            StackResume Admin
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/admin/submissions" className="text-sm text-slate-300 hover:text-white">
              Submissions
            </Link>
            <Link href="/admin/queue" className="text-sm text-slate-300 hover:text-white">
              Queue
            </Link>
            <Link href="/admin/changes" className="text-sm text-slate-300 hover:text-white">
              Changes
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-slate-300 hover:text-white">
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>
      
      <main className="container-wide py-8">
        {children}
      </main>
    </div>
  )
}
