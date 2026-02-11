'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Cloud, Mail, Lock, User, AlertCircle, Check } from 'lucide-react'

const PLANS = {
  basic: {
    name: 'Basic',
    price: 497,
    priceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    features: [
      'Real-time storm alerts',
      'Up to 50 leads/month',
      'Email notifications',
      'Basic dashboard',
      '30-day lead history'
    ]
  },
  pro: {
    name: 'Pro',
    price: 1495,
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Basic',
      'Unlimited leads',
      'SMS + Telegram alerts',
      'Priority lead access',
      'CRM integration',
      'API access',
      '1-year lead history'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 4995,
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Pro',
      'First access to leads',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
      'Team accounts (5 users)',
      'Lifetime lead history'
    ]
  }
}

export default function Signup() {
  const searchParams = useSearchParams()
  const defaultPlan = (searchParams.get('plan') || 'pro') as keyof typeof PLANS

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          subscription_tier: selectedPlan
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Redirect to Stripe Checkout
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PLANS[selectedPlan].priceId,
          userId: authData.user?.id,
          email: email
        })
      })

      const { url, error: checkoutError } = await response.json()

      if (checkoutError) {
        setError(checkoutError)
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Failed to create checkout session')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white mb-4">
            <Cloud className="w-10 h-10 text-blue-400" />
            <span className="text-3xl font-bold">Storm Chaser</span>
          </Link>
          <p className="text-slate-400">Start your 14-day free trial</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {Object.entries(PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
                  className={`cursor-pointer rounded-lg border-2 p-6 transition ${
                    selectedPlan === key
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {selectedPlan === key && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Signup Form */}
          <div className="lg:col-span-3 max-w-md mx-auto w-full">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
              <h3 className="text-xl font-bold text-white mb-6">Create Your Account</h3>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>14-day free trial.</strong> No credit card required. Cancel anytime.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    `Start Free Trial → ${PLANS[selectedPlan].name} Plan`
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-blue-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>

            <p className="text-center text-slate-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
