import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

export default function APIDetail() {
  const { slug } = useParams()
  const [api, setApi] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAPI()
  }, [slug])

  const fetchAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/apis/${slug}`)
      const data = await response.json()
      setApi(data)
    } catch (error) {
      console.error('Error fetching API:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading API details...</p>
      </div>
    )
  }

  if (!api) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">API not found</p>
        <Link to="/browse" className="text-blue-600 hover:text-blue-700">
          ← Back to browse
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/browse" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back to browse
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{api.name}</h1>
              {api.verified && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-600 text-lg">{api.short_description}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <div className="text-sm text-gray-500 mb-1">Provider</div>
            <div className="font-semibold">{api.provider_name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Category</div>
            <div className="font-semibold">{api.category || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Pricing</div>
            <div className="font-semibold capitalize">{api.pricing}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Auth Type</div>
            <div className="font-semibold">{api.auth_type}</div>
          </div>
        </div>

        {api.tags && api.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500 mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {api.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {api.long_description && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-line">{api.long_description}</p>
        </div>
      )}

      {/* Authentication */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <div className="mb-3">
          <span className="font-semibold">Type:</span> {api.auth_type}
        </div>
        {api.auth_instructions && (
          <div className="bg-gray-50 rounded p-4">
            <p className="text-sm text-gray-700">{api.auth_instructions}</p>
          </div>
        )}
      </div>

      {/* Endpoints */}
      {api.endpoints && api.endpoints.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Endpoints</h2>
          <div className="space-y-4">
            {api.endpoints.map((endpoint) => (
              <div key={endpoint.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-mono rounded">
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-gray-700">{endpoint.url}</code>
                </div>
                {endpoint.description && (
                  <p className="text-sm text-gray-600">{endpoint.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {api.examples && api.examples.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Examples</h2>
          <div className="space-y-6">
            {api.examples.map((example) => (
              <div key={example.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{example.title}</h3>
                {example.description && (
                  <p className="text-sm text-gray-600 mb-3">{example.description}</p>
                )}
                {example.request_example && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Request:</div>
                    <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(example.request_example, null, 2)}
                    </pre>
                  </div>
                )}
                {example.response_example && (
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Response:</div>
                    <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(example.response_example, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract */}
      {api.contract_url && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">API Contract</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Type: {api.contract_type}</span>
            <a
              href={api.contract_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              View Documentation →
            </a>
          </div>
        </div>
      )}

      {/* Test Endpoint */}
      {api.test_endpoint && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Test Endpoint</h3>
          <code className="text-sm text-gray-700">{api.test_endpoint}</code>
        </div>
      )}
    </div>
  )
}
