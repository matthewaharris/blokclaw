import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [apis, setApis] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  useEffect(() => {
    fetchAPIs()
  }, [searchParams])

  const fetchAPIs = async () => {
    setLoading(true)
    try {
      const q = searchParams.get('q')
      const cat = searchParams.get('category')
      
      let url = '/api/v1/apis'
      if (q) {
        url = `/api/v1/search?q=${encodeURIComponent(q)}`
        if (cat) url += `&category=${encodeURIComponent(cat)}`
      } else if (cat) {
        url += `?category=${encodeURIComponent(cat)}`
      }
      
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
    const params = {}
    if (searchQuery) params.q = searchQuery
    if (category) params.category = category
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('')
    setSearchParams({})
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse APIs</h1>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search APIs..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="weather">Weather</option>
              <option value="payments">Payments</option>
              <option value="communication">Communication</option>
              <option value="developer-tools">Developer Tools</option>
              <option value="data">Data</option>
            </select>
          </div>
          
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
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading APIs...</p>
        </div>
      ) : apis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">No APIs found</p>
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
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{api.name}</h3>
                    {api.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{api.short_description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👤 {api.provider_name}</span>
                    {api.category && (
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {api.category}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {api.pricing}
                    </span>
                    <span>🔑 {api.auth_type}</span>
                  </div>
                  
                  {api.tags && api.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {api.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="text-right text-sm text-gray-400 ml-4">
                  <div>👁 {api.view_count} views</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
