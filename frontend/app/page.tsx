'use client'

import Link from 'next/link'
import { Cloud, Zap, DollarSign, MapPin, Bell, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Cloud className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold">Storm Chaser</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-white hover:text-blue-400 transition">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Be First to Every Storm
        </h1>
        <p className="text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
          Real-time severe weather alerts with AI-powered lead generation.
          Get contractor-ready leads within minutes of storm detection.
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
          >
            Start 14-Day Free Trial
          </Link>
          <Link
            href="/demo"
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
          >
            Watch Demo
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>No recovery, no fee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>98% success rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>2,847 contractors served</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Why Contractors Choose Storm Chaser
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-yellow-400" />}
            title="Real-Time Alerts"
            description="Get notified within 5 minutes of severe weather in your service area. Be first to damaged properties."
          />
          <FeatureCard
            icon={<MapPin className="w-12 h-12 text-blue-400" />}
            title="AI Lead Scoring"
            description="Every property automatically scored by damage potential, property value, and homeowner info."
          />
          <FeatureCard
            icon={<DollarSign className="w-12 h-12 text-green-400" />}
            title="ROI Tracking"
            description="Track leads from alert to closed job. See your actual ROI from storm intelligence."
          />
          <FeatureCard
            icon={<Bell className="w-12 h-12 text-purple-400" />}
            title="Multi-Channel Alerts"
            description="Email, SMS, Telegram, Discord. Get alerted however you want, instantly."
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12 text-orange-400" />}
            title="Pattern Detection"
            description="AI identifies storm patterns and predicts where next severe weather will hit."
          />
          <FeatureCard
            icon={<Cloud className="w-12 h-12 text-cyan-400" />}
            title="NOAA Integration"
            description="Direct integration with NOAA weather data. Most accurate storm detection available."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Simple, Risk-Free Pricing
        </h2>
        <p className="text-slate-400 text-center mb-16">
          No find, no fee. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Basic"
            price="$497"
            period="/month"
            features={[
              "Real-time storm alerts",
              "Up to 50 leads/month",
              "Email notifications",
              "Basic dashboard",
              "30-day lead history"
            ]}
            cta="Start Free Trial"
            href="/signup?plan=basic"
          />
          <PricingCard
            name="Pro"
            price="$1,495"
            period="/month"
            popular
            features={[
              "Everything in Basic",
              "Unlimited leads",
              "SMS + Telegram alerts",
              "Priority lead access",
              "CRM integration",
              "API access",
              "1-year lead history"
            ]}
            cta="Start Free Trial"
            href="/signup?plan=pro"
          />
          <PricingCard
            name="Enterprise"
            price="$4,995"
            period="/month"
            features={[
              "Everything in Pro",
              "First access to leads",
              "White-label option",
              "Dedicated support",
              "Custom integrations",
              "Team accounts (5 users)",
              "Lifetime lead history"
            ]}
            cta="Contact Sales"
            href="/contact"
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Real Contractors, Real Results
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            quote="Storm Chaser helped me close $47,000 in jobs from a single hailstorm. First time I beat my competitors to the leads."
            author="Mike R."
            role="Owner, Elite Roofing Co"
            rating={5}
          />
          <TestimonialCard
            quote="The AI scoring is incredible. Only shows me high-value properties. My close rate went from 15% to 60%."
            author="Sarah K."
            role="Sales Manager, Apex Contractors"
            rating={5}
          />
          <TestimonialCard
            quote="ROI in first week. The alerts come so fast I'm literally first on scene. Worth every penny."
            author="David L."
            role="Owner, Storm Pro Roofing"
            rating={5}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Next Storm is Coming
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Don't let your competitors get there first
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
          >
            Start Free Trial → Be First to Next Storm
          </Link>
          <p className="text-blue-200 text-sm mt-4">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-800">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <Cloud className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">Storm Chaser</span>
            </div>
            <p className="text-slate-400 text-sm">
              AI-powered storm intelligence for contractors
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/demo">Demo</Link></li>
              <li><Link href="/api">API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
          © 2026 Storm Chaser. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

function PricingCard({ name, price, period, features, cta, href, popular }: any) {
  return (
    <div className={`bg-slate-800/50 backdrop-blur border ${popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-700'} rounded-xl p-8 relative`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-slate-400">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-slate-300">
            <span className="text-green-400 mt-1">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center py-3 rounded-lg font-semibold transition ${
          popular
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

function TestimonialCard({ quote, author, role, rating }: any) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
      </div>
      <p className="text-slate-300 mb-4">"{quote}"</p>
      <div>
        <p className="text-white font-semibold">{author}</p>
        <p className="text-slate-400 text-sm">{role}</p>
      </div>
    </div>
  )
}
