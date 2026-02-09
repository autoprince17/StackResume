'use client'

import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-slate-900">StackResume</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="h-40 flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
