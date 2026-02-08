'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertCircle } from 'lucide-react'

export default function ManualDeployPage() {
  const router = useRouter()
  const [isDeploying, setIsDeploying] = useState(false)
  const [result, setResult] = useState<{success?: boolean; message?: string} | null>(null)

  const runDeployment = async () => {
    setIsDeploying(true)
    setResult(null)

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual: true })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Deployed ${data.processed} portfolios successfully`
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Deployment failed'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to run deployment'
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manual Deployment</h1>
        <p className="text-slate-600 mt-2">
          Run deployment queue manually (for Hobby tier)
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Deployments</h3>
        <p className="text-blue-800 text-sm mb-4">
          On Vercel's free Hobby plan, automatic cron jobs run once per day at 2 AM UTC. 
          Use this button to manually trigger deployments when you need them sooner.
        </p>
        <p className="text-blue-800 text-sm">
          <strong>Pro tip:</strong> Upgrade to Vercel Pro ($20/month) for unlimited cron jobs 
          that run every 10 minutes automatically.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <button
          onClick={runDeployment}
          disabled={isDeploying}
          className="btn btn-primary text-lg px-8 py-4"
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Running Deployment Queue...
            </>
          ) : (
            'Run Deployment Queue Now'
          )}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-center gap-2">
              {result.success ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Alternative Options</h3>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span><strong>Wait for daily cron:</strong> Deployments run automatically at 2 AM UTC daily</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span><strong>Use this button:</strong> Trigger manually whenever you approve submissions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">→</span>
            <span><strong>Upgrade to Pro:</strong> $20/month for unlimited cron jobs every 10 minutes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">→</span>
            <span><strong>External cron service:</strong> Use cron-job.org (free) to ping your API</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
