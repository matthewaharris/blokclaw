import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../config'
import HealthBadge from '../components/HealthBadge'

export default function Browse() {
  const { isDark } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const [apis, setApis] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [showUnverified, setShowUnverified] = useState(false)

  useEffect(() => {
    fetchAPIs()
  }, [searchParams, showUnverified])

  const fetchAPIs = async () => {
    setLoading(true)
    try {
      const q = searchParams.get('q')
      const cat = searchParams.get('category')

      let url = `${API_BASE_URL}/api/v1/apis`
      const params = new URLSearchParams()

      if (q) {
        url = `${API_BASE_URL}/api/v1/search`
        params.set('q', q)
        if (cat) params.set('category', cat)
      } else {
        if (cat) params.set('category', cat)
      }

      if (!showUnverified) {
        params.set('verified', 'true')
      }

      const queryString = params.toString()
      if (queryString) url += `?${queryString}`

      const response = await fetch(url)
      const data = await response.json()
      setApis(data.apis || data.results || [])
    } catch (error) {
      console.error('Error fetching APIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch()
  }

  const performSearch = (overrides = {}) => {
    const q = overrides.q !== undefined ? overrides.q : searchQuery
    const cat = overrides.category !== undefined ? overrides.category : category
    const params = {}
    if (q) params.q = q
    if (cat) params.category = cat
    setSearchParams(params)
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    performSearch({ category: newCategory })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('')
    setSearchParams({})
  }

  const cardClass = isDark ? 'bg-slate-800' : 'bg-white'
  const inputClass = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500'
    : 'border-gray-300 focus:ring-blue-500'

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Browse APIs
      </h1>

      {/* Search & Filters */}
      <div className={`${cardClass} rounded-lg shadow-sm p-6 mb-6`}>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search APIs..."
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
            />
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
            >
              <option value="">All Categories</option>
              <option value="weather">Weather</option>
              <option value="payments">Payments</option>
              <option value="communication">Communication</option>
              <option value="developer-tools">Developer Tools</option>
              <option value="data">Data</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
              {(searchQuery || category) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`px-6 py-2 rounded-lg transition ${
                    isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Unverified toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnverified}
                onChange={(e) => setShowUnverified(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Show unverified APIs
              </span>
            </label>
          </div>
        </form>
      </div>

      {/* Unverified warning banner */}
      {showUnverified && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isDark
            ? 'bg-amber-900/20 border-amber-800 text-amber-400'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <strong>Warning:</strong> Unverified APIs are shown. These have not been reviewed and may
          contain inaccurate information or point to unreliable endpoints. Use at your own risk.
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>Loading APIs...</p>
        </div>
      ) : apis.length === 0 ? (
        <div className={`text-center py-12 ${cardClass} rounded-lg shadow-sm`}>
          <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No APIs found</p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apis.map((api) => (
            <Link
              key={api.id}
              to={`/api/${api.slug}`}
              className={`block ${cardClass} rounded-lg shadow-sm p-6 hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {api.name}
                    </h3>
                    {api.verified ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Verified
                      </span>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        Unverified
                      </span>
                    )}
                    <HealthBadge status={api.health_status} />
                  </div>

                  <p className={`mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {api.short_description}
                  </p>

                  <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                    <span>{api.provider_name}</span>
                    {api.category && (
                      <span className={`px-2 py-1 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                        {api.category}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                      {api.pricing}
                    </span>
                    <span>{api.auth_type}</span>
                  </div>

                  {api.tags && api.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {api.tags.map((tag, i) => (
                        <span key={i} className={`px-2 py-1 text-xs rounded ${
                          isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-50 text-gray-600'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`text-right text-sm ml-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  <div>{api.view_count} views</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
