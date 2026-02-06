import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { API_BASE_URL } from '../config'

export default function Stats() {
  const { isDark } = useTheme()
  const [stats, setStats] = useState({
    totalAPIs: 0,
    totalProviders: 0,
    verifiedAPIs: 0,
    totalAgents: 0,
    categories: [],
    recentAPIs: [],
    topAPIs: []
  })
  const [timeseriesData, setTimeseriesData] = useState([])
  const [topAgents, setTopAgents] = useState([])
  const [topDiscovered, setTopDiscovered] = useState([])
  const [discoveryTrends, setDiscoveryTrends] = useState([])
  const [dateRange, setDateRange] = useState(30)
  const [loading, setLoading] = useState(true)

  const cardClass = isDark ? 'bg-slate-800' : 'bg-white'
  const headingClass = isDark ? 'text-white' : 'text-gray-900'
  const textClass = isDark ? 'text-slate-300' : 'text-gray-700'
  const subTextClass = isDark ? 'text-slate-400' : 'text-gray-500'
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'
  const inputClass = isDark
    ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
    : 'border-gray-300 focus:ring-blue-500'
  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }
    : {}

  useEffect(() => {
    fetchStats()
    fetchTimeseries(dateRange)
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchTimeseries(dateRange)
  }, [dateRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/apis?limit=100`)
      const data = await response.json()
      const apis = data.apis || []

      const providers = new Set(apis.map(api => api.provider_name))
      const verified = apis.filter(api => api.verified).length

      const categoryCount = {}
      apis.forEach(api => {
        if (api.category) {
          categoryCount[api.category] = (categoryCount[api.category] || 0) + 1
        }
      })
      const categories = Object.entries(categoryCount).map(([name, count]) => ({ name, count }))

      const recent = apis.slice(0, 5)
      const top = [...apis].sort((a, b) => b.view_count - a.view_count).slice(0, 5)

      const summaryRes = await fetch(`${API_BASE_URL}/api/v1/stats/summary`)
      const summary = await summaryRes.json()

      setStats({
        totalAPIs: apis.length,
        totalProviders: providers.size,
        verifiedAPIs: verified,
        totalAgents: summary.total_agents || 0,
        categories,
        recentAPIs: recent,
        topAPIs: top
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeseries = async (days) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/stats/timeseries?days=${days}`)
      const data = await response.json()

      const formatted = data.data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'APIs Registered': item.apis_registered,
        'Unique Agents': item.unique_agents,
        'Total APIs': item.total_apis,
        'Total Agents': item.total_agents
      }))

      setTimeseriesData(formatted)
    } catch (error) {
      console.error('Error fetching timeseries:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const [agentsRes, discoveredRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/stats/agents/top`),
        fetch(`${API_BASE_URL}/api/v1/stats/apis/top-discovered`),
        fetch(`${API_BASE_URL}/api/v1/stats/agents/discovery-trends?days=30`)
      ])

      if (agentsRes.ok) {
        const data = await agentsRes.json()
        setTopAgents(data.agents || [])
      }
      if (discoveredRes.ok) {
        const data = await discoveredRes.json()
        setTopDiscovered(data.apis || [])
      }
      if (trendsRes.ok) {
        const data = await trendsRes.json()
        setDiscoveryTrends((data.data || []).map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          discoveries: parseInt(d.discoveries)
        })))
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className={subTextClass}>Loading stats...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className={`text-3xl font-bold mb-8 ${headingClass}`}>Registry Statistics</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalAPIs}</div>
          <div className={subTextClass}>Total APIs</div>
        </div>
        <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.verifiedAPIs}</div>
          <div className={subTextClass}>Verified APIs</div>
        </div>
        <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalProviders}</div>
          <div className={subTextClass}>Providers</div>
        </div>
        <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
          <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalAgents}</div>
          <div className={subTextClass}>AI Agents</div>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className={`${cardClass} rounded-lg shadow-sm p-6 mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${headingClass}`}>Growth Over Time</h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${subTextClass}`}>Time range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${inputClass}`}
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {timeseriesData.length > 0 ? (
          <div className="space-y-8">
            <div>
              <h3 className={`text-sm font-semibold mb-4 ${textClass}`}>Daily Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeseriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
                  <YAxis style={{ fontSize: '12px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="APIs Registered" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Unique Agents" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className={`text-sm font-semibold mb-4 ${textClass}`}>Cumulative Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeseriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
                  <YAxis style={{ fontSize: '12px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="Total APIs" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Total Agents" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className={`${subTextClass} text-center py-8`}>No time-series data available</p>
        )}
      </div>

      {/* Discovery Trends */}
      {discoveryTrends.length > 0 && (
        <div className={`${cardClass} rounded-lg shadow-sm p-6 mb-8`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Discovery Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={discoveryTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" style={{ fontSize: '12px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis style={{ fontSize: '12px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="discoveries" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} name="Discoveries" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Categories */}
        <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>APIs by Category</h2>
          {stats.categories.length > 0 ? (
            <div className="space-y-3">
              {stats.categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className={`capitalize ${textClass}`}>{cat.name}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100'}`}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={subTextClass}>No data</p>
          )}
        </div>

        {/* Top APIs */}
        <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Most Viewed APIs</h2>
          {stats.topAPIs.length > 0 ? (
            <div className="space-y-3">
              {stats.topAPIs.map((api, index) => (
                <div key={api.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${subTextClass}`}>#{index + 1}</span>
                    <span className={textClass}>{api.name}</span>
                  </div>
                  <span className={`text-sm ${subTextClass}`}>{api.view_count} views</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={subTextClass}>No data</p>
          )}
        </div>
      </div>

      {/* Top Discovering Agents */}
      {topAgents.length > 0 && (
        <div className={`${cardClass} rounded-lg shadow-sm p-6 mt-8`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Top Discovering Agents</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${borderClass}`}>
                  <th className={`text-left py-2 pr-4 font-semibold ${subTextClass}`}>Agent</th>
                  <th className={`text-left py-2 pr-4 font-semibold ${subTextClass}`}>Platform</th>
                  <th className={`text-right py-2 pr-4 font-semibold ${subTextClass}`}>Submissions</th>
                  <th className={`text-right py-2 font-semibold ${subTextClass}`}>Discoveries</th>
                </tr>
              </thead>
              <tbody>
                {topAgents.slice(0, 10).map((agent) => (
                  <tr key={agent.agent_id} className={`border-b ${borderClass}`}>
                    <td className={`py-2 pr-4 ${textClass}`}>{agent.name || agent.agent_id}</td>
                    <td className={`py-2 pr-4 ${subTextClass}`}>{agent.platform || '-'}</td>
                    <td className={`py-2 pr-4 text-right ${textClass}`}>{agent.api_submissions}</td>
                    <td className={`py-2 text-right ${textClass}`}>{agent.api_discoveries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Most Discovered APIs */}
      {topDiscovered.length > 0 && (
        <div className={`${cardClass} rounded-lg shadow-sm p-6 mt-8`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Most Discovered APIs</h2>
          <div className="space-y-3">
            {topDiscovered.map((api, index) => (
              <div key={api.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${subTextClass}`}>#{index + 1}</span>
                  <div>
                    <span className={textClass}>{api.name}</span>
                    <span className={`ml-2 text-xs ${subTextClass}`}>{api.category}</span>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  {api.discovery_count} discoveries
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Submissions Chart */}
      {topAgents.length > 0 && (
        <div className={`${cardClass} rounded-lg shadow-sm p-6 mt-8`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Agent Submissions</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topAgents.slice(0, 10).map(a => ({
              name: (a.name || a.agent_id).slice(0, 15),
              submissions: a.api_submissions,
              discoveries: a.api_discoveries
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" style={{ fontSize: '11px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis style={{ fontSize: '12px' }} tick={{ fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="submissions" fill="#3B82F6" name="Submissions" />
              <Bar dataKey="discoveries" fill="#06B6D4" name="Discoveries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent APIs */}
      <div className={`${cardClass} rounded-lg shadow-sm p-6 mt-8`}>
        <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Recently Added</h2>
        {stats.recentAPIs.length > 0 ? (
          <div className="space-y-4">
            {stats.recentAPIs.map((api) => (
              <div key={api.id} className={`flex items-center justify-between border-b pb-3 last:border-b-0 ${borderClass}`}>
                <div>
                  <div className={`font-semibold ${headingClass}`}>{api.name}</div>
                  <div className={`text-sm ${subTextClass}`}>{api.provider_name}</div>
                </div>
                <div className={`text-sm ${subTextClass}`}>
                  {new Date(api.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={subTextClass}>No recent APIs</p>
        )}
      </div>

      {/* Agent Info */}
      <div className={`rounded-lg p-6 mt-8 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50'}`}>
        <h2 className={`text-lg font-bold mb-2 ${headingClass}`}>For AI Agents</h2>
        <p className={`mb-3 ${textClass}`}>
          To programmatically discover APIs, use the search endpoint:
        </p>
        <code className={`block rounded p-3 text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white'}`}>
          GET /api/v1/search?q=weather&category=weather&tags=forecast
        </code>
        <p className={`text-sm mt-3 ${subTextClass}`}>
          Returns structured JSON with API contracts, auth requirements, and integration examples.
        </p>
      </div>
    </div>
  )
}
