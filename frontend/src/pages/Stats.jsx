import { useState, useEffect } from 'react'

export default function Stats() {
  const [stats, setStats] = useState({
    totalAPIs: 0,
    totalProviders: 0,
    verifiedAPIs: 0,
    categories: [],
    recentAPIs: [],
    topAPIs: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Fetch all APIs to calculate stats
      const response = await fetch('/api/v1/apis?limit=100')
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

      setStats({
        totalAPIs: apis.length,
        totalProviders: providers.size,
        verifiedAPIs: verified,
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
            {stats.categories.length}
          </div>
          <div className="text-gray-600">Categories</div>
        </div>
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
