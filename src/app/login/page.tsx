import { signInWithEmail } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signInWithEmail(email, password)

    if (result.success) {
      redirect('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-600 mt-2">Sign in to access the admin dashboard</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
