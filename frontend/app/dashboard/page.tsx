'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Cloud, MapPin, AlertTriangle, TrendingUp, DollarSign, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamic import for map (client-side only)
const StormMap = dynamic(() => import('@/components/StormMap'), { ssr: false })

interface Storm {
  id: string
  event_id: string
  event_type: string
  severity: number
  headline: string
  city: string
  state: string
  latitude: number
  longitude: number
  estimated_homes: number
  start_time: string
  status: string
}

interface Lead {
  id: string
  storm_id: string
  address: string
  city: string
  state: string
  estimated_value: number
  damage_score: number
  lead_quality_score: number
  status: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [activeStorms, setActiveStorms] = useState<Storm[]>([])
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([])
  const [claimedLeads, setClaimedLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeStorms: 0,
    availableLeads: 0,
    claimedThisWeek: 0,
    estRevenue: 0
  })

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchData()
    setupRealtimeSubscriptions()
    requestNotificationPermission()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
  }

  async function fetchData() {
    setLoading(true)

    // Fetch active storms
    const { data: storms } = await supabase
      .from('storms')
      .select('*')
      .eq('status', 'active')
      .order('severity', { ascending: false })
      .limit(50)

    setActiveStorms(storms || [])

    // Fetch available leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'available')
      .order('lead_quality_score', { ascending: false })
      .limit(100)

    setAvailableLeads(leads || [])

    // Fetch claimed leads
    const { data: claimed } = await supabase
      .from('leads')
      .select('*')
      .eq('claimed_by', user?.id)
      .order('claimed_at', { ascending: false })
      .limit(50)

    setClaimedLeads(claimed || [])

    // Update stats
    setStats({
      activeStorms: storms?.length || 0,
      availableLeads: leads?.length || 0,
      claimedThisWeek: claimed?.length || 0,
      estRevenue: calculateEstRevenue(claimed || [])
    })

    setLoading(false)
  }

  function setupRealtimeSubscriptions() {
    // Subscribe to new storms
    const stormsChannel = supabase
      .channel('storms-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'storms' },
        (payload) => {
          const newStorm = payload.new as Storm
          setActiveStorms(prev => [newStorm, ...prev])
          showNotification('New Storm Alert!', `${newStorm.event_type} detected in ${newStorm.city}, ${newStorm.state}`)
          setStats(prev => ({ ...prev, activeStorms: prev.activeStorms + 1 }))
        }
      )
      .subscribe()

    // Subscribe to new leads
    const leadsChannel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          const newLead = payload.new as Lead
          if (newLead.status === 'available') {
            setAvailableLeads(prev => [newLead, ...prev])
            setStats(prev => ({ ...prev, availableLeads: prev.availableLeads + 1 }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(stormsChannel)
      supabase.removeChannel(leadsChannel)
    }
  }

  async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  function showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/storm-icon.png' })
    }
  }

  function calculateEstRevenue(leads: Lead[]) {
    // Estimate $1,500 avg per claimed lead
    return leads.length * 1500
  }

  async function claimLead(leadId: string) {
    const { error } = await supabase
      .from('leads')
      .update({
        status: 'claimed',
        claimed_by: user?.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (!error) {
      // Move lead from available to claimed
      const lead = availableLeads.find(l => l.id === leadId)
      if (lead) {
        setAvailableLeads(prev => prev.filter(l => l.id !== leadId))
        setClaimedLeads(prev => [{ ...lead, status: 'claimed' }, ...prev])
        setStats(prev => ({
          ...prev,
          availableLeads: prev.availableLeads - 1,
          claimedThisWeek: prev.claimedThisWeek + 1
        }))
      }
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Cloud className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Storm Chaser</h1>
                <p className="text-sm text-slate-400">Real-time Storm Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition relative">
                <Bell className="w-5 h-5 text-slate-300" />
                {stats.activeStorms > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.activeStorms}
                  </span>
                )}
              </button>
              <div className="text-right">
                <p className="text-sm text-white">{user?.email}</p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<AlertTriangle className="w-8 h-8" />}
            title="Active Storms"
            value={stats.activeStorms}
            color="text-red-400"
            bgColor="bg-red-500/10"
          />
          <StatCard
            icon={<MapPin className="w-8 h-8" />}
            title="Available Leads"
            value={stats.availableLeads}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Claimed This Week"
            value={stats.claimedThisWeek}
            color="text-green-400"
            bgColor="bg-green-500/10"
          />
          <StatCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Est. Revenue"
            value={`$${stats.estRevenue.toLocaleString()}`}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Storm Map
              </h2>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <StormMap storms={activeStorms} />
              </div>
            </div>
          </div>

          {/* Active Storms List */}
          <div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Active Alerts
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {activeStorms.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">
                    No active storms. All clear! ☀️
                  </p>
                ) : (
                  activeStorms.slice(0, 10).map(storm => (
                    <StormCard key={storm.id} storm={storm} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Available Leads
          </h2>
          <div className="overflow-x-auto">
            {availableLeads.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                No leads available. Check back after next storm.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                    <th className="pb-3">Address</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Property Value</th>
                    <th className="pb-3">Damage Score</th>
                    <th className="pb-3">Quality Score</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableLeads.slice(0, 50).map(lead => (
                    <tr key={lead.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 text-white">{lead.address}</td>
                      <td className="py-3 text-slate-300">{lead.city}, {lead.state}</td>
                      <td className="py-3 text-slate-300">
                        ${lead.estimated_value?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          lead.damage_score >= 80 ? 'bg-red-500/20 text-red-400' :
                          lead.damage_score >= 60 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {lead.damage_score}/100
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          lead.lead_quality_score >= 80 ? 'bg-green-500/20 text-green-400' :
                          lead.lead_quality_score >= 60 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {lead.lead_quality_score}/100
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => claimLead(lead.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold transition"
                        >
                          Claim Lead
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, title, value, color, bgColor }: any) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${bgColor} ${color} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function StormCard({ storm }: { storm: Storm }) {
  const severityColor = storm.severity >= 8 ? 'text-red-400' : storm.severity >= 6 ? 'text-orange-400' : 'text-yellow-400'

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white text-sm">{storm.event_type.replace('_', ' ').toUpperCase()}</h3>
        <span className={`text-xl font-bold ${severityColor}`}>{storm.severity}/10</span>
      </div>
      <p className="text-sm text-slate-300 mb-2 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {storm.city}, {storm.state}
      </p>
      <p className="text-xs text-slate-400">
        ~{storm.estimated_homes?.toLocaleString() || 'Unknown'} homes affected
      </p>
    </div>
  )
}
