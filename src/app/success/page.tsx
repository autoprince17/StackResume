'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Clock, Mail, ArrowRight } from 'lucide-react'

export default function SuccessPage() {
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setStudentId(params.get('studentId'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Submission received!
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          Thank you for submitting your portfolio information. 
          We are reviewing your submission and will begin building your portfolio shortly.
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 text-left">
          <h2 className="font-semibold text-slate-900 mb-4">What happens next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Review</p>
                <p className="text-sm text-slate-600">
                  Our team reviews your submission for quality and completeness
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Build</p>
                <p className="text-sm text-slate-600">
                  We create your portfolio using the optimal template for your role
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Launch</p>
                <p className="text-sm text-slate-600">
                  You will receive an email with your live portfolio link within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="btn btn-primary w-full"
          >
            Return to Home
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>

          <p className="text-sm text-slate-500">
            Questions?{' '}
            <a href="mailto:hello@stackresume.com" className="text-slate-900 underline">
              Contact support
            </a>
          </p>
        </div>

        {studentId && (
          <p className="mt-8 text-xs text-slate-400">
            Reference ID: {studentId}
          </p>
        )}
      </div>
    </div>
  )
}
