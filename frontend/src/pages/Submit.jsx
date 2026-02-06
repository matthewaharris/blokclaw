import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config'

export default function Submit() {
  const { isDark } = useTheme()
  const { isAuthenticated, token } = useAuth()
  const [step, setStep] = useState(isAuthenticated ? 2 : 1)
  const [tosAccepted, setTosAccepted] = useState(false)
  const [provider, setProvider] = useState({
    email: '',
    password: '',
    name: '',
    website: ''
  })
  const [api, setApi] = useState({
    name: '',
    short_description: '',
    long_description: '',
    category: '',
    contract_url: '',
    auth_type: 'apikey',
    auth_instructions: '',
    pricing: 'free',
    tags: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [registrationDone, setRegistrationDone] = useState(false)

  const handleProviderSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: provider.email,
          password: provider.password,
          name: provider.name,
          website: provider.website || undefined,
          tos_accepted: String(tosAccepted)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError('An account with this email already exists. Please log in instead.')
          return
        }
        throw new Error(data.errors?.[0]?.msg || data.error || 'Failed to register provider')
      }

      setRegistrationDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAPISubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const tags = api.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const payload = {
        name: api.name,
        short_description: api.short_description,
        long_description: api.long_description,
        category: api.category,
        contract_url: api.contract_url,
        auth_type: api.auth_type,
        auth_instructions: api.auth_instructions,
        pricing: api.pricing,
        tags,
        tos_accepted: 'true'
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/apis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.msg || data.error || 'Failed to register API')
      }

      setSuccess(`API registered successfully! Slug: ${data.api.slug}`)

      setTimeout(() => {
        setApi({
          name: '',
          short_description: '',
          long_description: '',
          category: '',
          contract_url: '',
          auth_type: 'apikey',
          auth_instructions: '',
          pricing: 'free',
          tags: ''
        })
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const cardClass = isDark ? 'bg-slate-800' : 'bg-white'
  const inputClass = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500'
    : 'border-gray-300 focus:ring-blue-500'
  const labelClass = isDark ? 'text-slate-300' : 'text-gray-900'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Register an API
      </h1>
      <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        Make your API discoverable to AI agents worldwide
      </p>

      {!isAuthenticated && (
        <div className="flex items-center mb-8">
          <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`px-4 font-semibold ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>→</div>
          <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
        </div>
      )}

      {error && (
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-red-900/30 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      {success && (
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-green-900/30 border border-green-800 text-green-400' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {success}
        </div>
      )}

      {/* Registration complete message */}
      {registrationDone && (
        <div className={`${cardClass} rounded-lg shadow-sm p-8`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Check Your Email
          </h2>
          <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            We've sent a verification email to <strong>{provider.email}</strong>. Please click the link in that email to verify your account.
          </p>
          <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Once verified, you can log in and submit APIs.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      )}

      {/* Step 1: Provider Registration (only if not authenticated) */}
      {!isAuthenticated && step === 1 && !registrationDone && (
        <form onSubmit={handleProviderSubmit} className={`${cardClass} rounded-lg shadow-sm p-8`}>
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Step 1: Create Account
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={provider.email}
                onChange={(e) => setProvider({ ...provider, email: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={provider.password}
                onChange={(e) => setProvider({ ...provider, password: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
                Provider Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={provider.name}
                onChange={(e) => setProvider({ ...provider, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="Your Company or Name"
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Website</label>
              <input
                type="url"
                value={provider.website}
                onChange={(e) => setProvider({ ...provider, website: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="https://example.com"
              />
            </div>

            <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-slate-700/50 border border-slate-600' : 'bg-gray-50 border border-gray-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tosAccepted}
                  onChange={(e) => setTosAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-blue-500 hover:text-blue-400 underline">
                    Terms of Service
                  </Link>
                  . I understand that submitted APIs are not automatically verified and that
                  BlokClaw reserves the right to remove any listing.
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !tosAccepted}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Registering...' : 'Create Account'}
          </button>

          <p className={`mt-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400">
              Log in
            </Link>
          </p>
        </form>
      )}

      {/* Step 2: API Details (authenticated users or step 2 of registration) */}
      {isAuthenticated && !registrationDone && (
        <form onSubmit={handleAPISubmit} className={`${cardClass} rounded-lg shadow-sm p-8`}>
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            API Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
                API Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={api.name}
                onChange={(e) => setApi({ ...api, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="My Awesome API"
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
                Short Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={10}
                maxLength={500}
                value={api.short_description}
                onChange={(e) => setApi({ ...api, short_description: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="One-line summary (10-500 chars)"
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Long Description</label>
              <textarea
                rows={4}
                value={api.long_description}
                onChange={(e) => setApi({ ...api, long_description: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="Detailed description of your API..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Category</label>
                <select
                  value={api.category}
                  onChange={(e) => setApi({ ...api, category: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                >
                  <option value="">Select category</option>
                  <option value="weather">Weather</option>
                  <option value="payments">Payments</option>
                  <option value="communication">Communication</option>
                  <option value="developer-tools">Developer Tools</option>
                  <option value="data">Data</option>
                  <option value="ai">AI/ML</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Pricing</label>
                <select
                  value={api.pricing}
                  onChange={(e) => setApi({ ...api, pricing: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Documentation URL</label>
              <input
                type="url"
                value={api.contract_url}
                onChange={(e) => setApi({ ...api, contract_url: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="https://docs.example.com/api"
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Auth Type</label>
              <select
                value={api.auth_type}
                onChange={(e) => setApi({ ...api, auth_type: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
              >
                <option value="none">None</option>
                <option value="apikey">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="oauth2">OAuth 2.0</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Auth Instructions</label>
              <textarea
                rows={2}
                value={api.auth_instructions}
                onChange={(e) => setApi({ ...api, auth_instructions: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="How to authenticate with your API..."
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
                Tags <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>(comma-separated)</span>
              </label>
              <input
                type="text"
                value={api.tags}
                onChange={(e) => setApi({ ...api, tags: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
                placeholder="weather, forecast, climate"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit API'}
          </button>
        </form>
      )}

      {/* Not authenticated and not on step 1 - shouldn't happen but handle gracefully */}
      {!isAuthenticated && !registrationDone && step !== 1 && (
        <div className={`${cardClass} rounded-lg shadow-sm p-8 text-center`}>
          <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            You need to be logged in to submit an API.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  )
}
