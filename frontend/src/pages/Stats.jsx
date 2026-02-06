import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { API_BASE_URL } from '../config'

export default function Stats() {
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
  const [dateRange, setDateRange] = useState(30) // days
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchTimeseries(dateRange)
  }, [])

  useEffect(() => {
    fetchTimeseries(dateRange)
  }, [dateRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Fetch all APIs to calculate stats
      const response = await fetch(`${API_BASE_URL}/api/v1/apis?limit=100`)
      const data = await response.json()
      const apis = data.apis || []

      // Calculate stats
      const providers = new Set(apis.map(api => api.provider_name))
      const verified = apis.filter(api => api.verified).length
      
      // Category breakdown
      const categoryCount = {}
      apis.forEach(api => {
        if (api.category) {
          categoryCount[api.category] = (categoryCount[api.category] || 0) + 1
        }
      })
      const categories = Object.entries(categoryCount).map(([name, count]) => ({ name, count }))

      // Recent APIs (last 5)
      const recent = apis.slice(0, 5)

      // Top APIs by views
      const top = [...apis].sort((a, b) => b.view_count - a.view_count).slice(0, 5)

      // Fetch agent count
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
      
      // Format data for charts
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading stats...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Registry Statistics</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalAPIs}
          </div>
          <div className="text-gray-600">Total APIs</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.verifiedAPIs}
          </div>
          <div className="text-gray-600">Verified APIs</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.totalProviders}
          </div>
          <div className="text-gray-600">Providers</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats.totalAgents}
          </div>
          <div className="text-gray-600">AI Agents</div>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Growth Over Time</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Time range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            {/* Daily Activity Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeseriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="APIs Registered" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Unique Agents" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cumulative Growth Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Cumulative Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeseriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Total APIs" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Total Agents" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No time-series data available</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">APIs by Category</h2>
          {stats.categories.length > 0 ? (
            <div className="space-y-3">
              {stats.categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{cat.name}</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        {/* Top APIs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Most Viewed APIs</h2>
          {stats.topAPIs.length > 0 ? (
            <div className="space-y-3">
              {stats.topAPIs.map((api, index) => (
                <div key={api.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-semibold">#{index + 1}</span>
                    <span className="text-gray-700">{api.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{api.view_count} views</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>
      </div>

      {/* Recent APIs */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Recently Added</h2>
        {stats.recentAPIs.length > 0 ? (
          <div className="space-y-4">
            {stats.recentAPIs.map((api) => (
              <div key={api.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div>
                  <div className="font-semibold">{api.name}</div>
                  <div className="text-sm text-gray-600">{api.provider_name}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(api.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent APIs</p>
        )}
      </div>

      {/* Agent Info */}
      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h2 className="text-lg font-bold mb-2">🤖 For AI Agents</h2>
        <p className="text-gray-700 mb-3">
          To programmatically discover APIs, use the search endpoint:
        </p>
        <code className="block bg-white rounded p-3 text-sm">
          GET /api/v1/search?q=weather&category=weather&tags=forecast
        </code>
        <p className="text-sm text-gray-600 mt-3">
          Returns structured JSON with API contracts, auth requirements, and integration examples.
        </p>
      </div>
    </div>
  )
}
