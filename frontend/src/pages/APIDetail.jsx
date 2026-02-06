import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../config'
import HealthBadge from '../components/HealthBadge'
import ValidationBadge from '../components/ValidationBadge'

export default function APIDetail() {
  const { isDark } = useTheme()
  const { slug } = useParams()
  const [api, setApi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportForm, setReportForm] = useState({
    reporter_type: 'user',
    reason: '',
    description: ''
  })
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)
  const [reportError, setReportError] = useState(null)

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

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setReportError(null)
    setReportSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/apis/${slug}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.msg || data.error || 'Failed to submit report')
      }

      setReportSuccess(true)
      setTimeout(() => {
        setShowReportModal(false)
        setReportSuccess(false)
        setReportForm({ reporter_type: 'user', reason: '', description: '' })
      }, 2000)
    } catch (err) {
      setReportError(err.message)
    } finally {
      setReportSubmitting(false)
    }
  }

  const cardClass = isDark ? 'bg-slate-800' : 'bg-white'
  const textClass = isDark ? 'text-slate-300' : 'text-gray-700'
  const headingClass = isDark ? 'text-white' : 'text-gray-900'
  const subTextClass = isDark ? 'text-slate-400' : 'text-gray-500'
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className={subTextClass}>Loading API details...</p>
      </div>
    )
  }

  if (!api) {
    return (
      <div className="text-center py-12">
        <p className={`${subTextClass} mb-4`}>API not found</p>
        <Link to="/browse" className="text-blue-600 hover:text-blue-700">
          Back to browse
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/browse" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
        Back to browse
      </Link>

      {/* Unverified Warning Banner */}
      {!api.verified && (
        <div className={`mb-6 p-4 rounded-lg border ${
          isDark
            ? 'bg-amber-900/20 border-amber-800 text-amber-400'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <strong>Unverified API:</strong> This API has not been verified by BlokClaw. The information
          provided may be inaccurate, and the endpoints may be unreliable or unsafe. Use at your own risk.
        </div>
      )}

      {/* Header */}
      <div className={`${cardClass} rounded-lg shadow-sm p-8 mb-6`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`text-3xl font-bold ${headingClass}`}>{api.name}</h1>
              {api.verified ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  Verified
                </span>
              ) : (
                <span className={`px-3 py-1 text-sm rounded-full ${
                  isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}>
                  Unverified
                </span>
              )}
            </div>
            <p className={`text-lg ${subTextClass}`}>{api.short_description}</p>
          </div>

          {/* Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className={`ml-4 px-4 py-2 text-sm rounded-lg border transition ${
              isDark
                ? 'border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            Report
          </button>
        </div>

        {/* Metadata */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t ${borderClass}`}>
          <div>
            <div className={`text-sm mb-1 ${subTextClass}`}>Provider</div>
            <div className={`font-semibold ${headingClass}`}>{api.provider_name}</div>
          </div>
          <div>
            <div className={`text-sm mb-1 ${subTextClass}`}>Category</div>
            <div className={`font-semibold ${headingClass}`}>{api.category || 'N/A'}</div>
          </div>
          <div>
            <div className={`text-sm mb-1 ${subTextClass}`}>Pricing</div>
            <div className={`font-semibold capitalize ${headingClass}`}>{api.pricing}</div>
          </div>
          <div>
            <div className={`text-sm mb-1 ${subTextClass}`}>Auth Type</div>
            <div className={`font-semibold ${headingClass}`}>{api.auth_type}</div>
          </div>
        </div>

        {/* Health Status */}
        {api.health_status && api.health_status !== 'unknown' && (
          <div className={`mt-4 pt-4 border-t ${borderClass}`}>
            <div className={`text-sm mb-2 ${subTextClass}`}>Health Status</div>
            <div className="flex items-center gap-3">
              <HealthBadge status={api.health_status} />
              {api.last_health_check && (
                <span className={`text-xs ${subTextClass}`}>
                  Last checked: {new Date(api.last_health_check).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {api.tags && api.tags.length > 0 && (
          <div className={`mt-4 pt-4 border-t ${borderClass}`}>
            <div className={`text-sm mb-2 ${subTextClass}`}>Tags</div>
            <div className="flex flex-wrap gap-2">
              {api.tags.map((tag, i) => (
                <span key={i} className={`px-3 py-1 text-sm rounded-full ${
                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {api.long_description && (
        <div className={`${cardClass} rounded-lg shadow-sm p-8 mb-6`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>About</h2>
          <p className={`whitespace-pre-line ${textClass}`}>{api.long_description}</p>
        </div>
      )}

      {/* Authentication */}
      <div className={`${cardClass} rounded-lg shadow-sm p-8 mb-6`}>
        <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Authentication</h2>
        <div className={`mb-3 ${textClass}`}>
          <span className="font-semibold">Type:</span> {api.auth_type}
        </div>
        {api.auth_instructions && (
          <div className={`rounded p-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${textClass}`}>{api.auth_instructions}</p>
          </div>
        )}
      </div>

      {/* Endpoints */}
      {api.endpoints && api.endpoints.length > 0 && (
        <div className={`${cardClass} rounded-lg shadow-sm p-8 mb-6`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Endpoints</h2>
          <div className="space-y-4">
            {api.endpoints.map((endpoint) => (
              <div key={endpoint.id} className={`border rounded-lg p-4 ${borderClass}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-mono rounded">
                    {endpoint.method}
                  </span>
                  <code className={`text-sm ${textClass}`}>{endpoint.url}</code>
                </div>
                {endpoint.description && (
                  <p className={`text-sm ${subTextClass}`}>{endpoint.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {api.examples && api.examples.length > 0 && (
        <div className={`${cardClass} rounded-lg shadow-sm p-8 mb-6`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Examples</h2>
          <div className="space-y-6">
            {api.examples.map((example) => (
              <div key={example.id} className={`border rounded-lg p-4 ${borderClass}`}>
                <h3 className={`font-semibold mb-2 ${headingClass}`}>{example.title}</h3>
                {example.description && (
                  <p className={`text-sm mb-3 ${subTextClass}`}>{example.description}</p>
                )}
                {example.request_example && (
                  <div className="mb-3">
                    <div className={`text-sm font-semibold mb-1 ${textClass}`}>Request:</div>
                    <pre className={`rounded p-3 text-xs overflow-x-auto ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-50 text-gray-700'}`}>
                      {JSON.stringify(example.request_example, null, 2)}
                    </pre>
                  </div>
                )}
                {example.response_example && (
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${textClass}`}>Response:</div>
                    <pre className={`rounded p-3 text-xs overflow-x-auto ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-50 text-gray-700'}`}>
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
        <div className={`${cardClass} rounded-lg shadow-sm p-8 mb-6`}>
          <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>API Contract</h2>
          <div className="flex items-center gap-4">
            <span className={textClass}>Type: {api.contract_type}</span>
            <ValidationBadge valid={api.openapi_valid} contractType={api.contract_type} />
            <a
              href={api.contract_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              View Documentation
            </a>
          </div>
          {api.openapi_valid === false && api.openapi_errors && (
            <div className={`mt-3 p-3 rounded text-sm ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
              <strong>Validation errors:</strong>
              <ul className="list-disc list-inside mt-1">
                {(Array.isArray(api.openapi_errors) ? api.openapi_errors : [api.openapi_errors]).slice(0, 5).map((err, i) => (
                  <li key={i}>{typeof err === 'string' ? err : err.message || JSON.stringify(err)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Test Endpoint */}
      {api.test_endpoint && (
        <div className={`rounded-lg p-6 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50'}`}>
          <h3 className={`font-semibold mb-2 ${headingClass}`}>Test Endpoint</h3>
          <code className={`text-sm ${textClass}`}>{api.test_endpoint}</code>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} rounded-lg shadow-xl p-8 max-w-md w-full`}>
            <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Report API</h2>
            <p className={`text-sm mb-6 ${subTextClass}`}>
              Report this API if you believe it violates our Terms of Service or poses a risk.
            </p>

            {reportSuccess ? (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
                Report submitted successfully. Thank you for helping keep BlokClaw safe.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                {reportError && (
                  <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}>
                    {reportError}
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${headingClass}`}>
                    I am a...
                  </label>
                  <select
                    value={reportForm.reporter_type}
                    onChange={(e) => setReportForm({ ...reportForm, reporter_type: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="agent">AI Agent</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${headingClass}`}>
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={reportForm.reason}
                    onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a reason</option>
                    <option value="malicious">Malicious / Security Risk</option>
                    <option value="spam">Spam</option>
                    <option value="inaccurate">Inaccurate Information</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${headingClass}`}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={10}
                    maxLength={1000}
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Please describe the issue (10-1000 characters)..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false)
                      setReportError(null)
                    }}
                    className={`px-6 py-2 rounded-lg transition ${
                      isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
