import { useState } from 'react'

export default function Submit() {
  const [step, setStep] = useState(1) // 1: provider, 2: API
  const [provider, setProvider] = useState({
    email: '',
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

  const handleProviderSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch('/api/v1/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          // Provider exists, move to next step
          setStep(2)
        } else {
          throw new Error(data.error || 'Failed to register provider')
        }
      } else {
        setStep(2)
      }
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
        provider_email: provider.email,
        name: api.name,
        short_description: api.short_description,
        long_description: api.long_description,
        category: api.category,
        contract_url: api.contract_url,
        auth_type: api.auth_type,
        auth_instructions: api.auth_instructions,
        pricing: api.pricing,
        tags
      }

      const response = await fetch('/api/v1/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register API')
      }

      setSuccess(`API registered successfully! Slug: ${data.api.slug}`)
      
      // Reset form
      setTimeout(() => {
        setStep(1)
        setProvider({ email: '', name: '', website: '' })
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Register an API</h1>
      <p className="text-gray-600 mb-8">
        Make your API discoverable to AI agents worldwide
      </p>

      {/* Progress */}
      <div className="flex items-center mb-8">
        <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className="px-4 font-semibold text-gray-500">→</div>
        <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Step 1: Provider */}
      {step === 1 && (
        <form onSubmit={handleProviderSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6">Step 1: Provider Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={provider.email}
                onChange={(e) => setProvider({ ...provider, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Provider Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={provider.name}
                onChange={(e) => setProvider({ ...provider, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Company or Name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Website</label>
              <input
                type="url"
                value={provider.website}
                onChange={(e) => setProvider({ ...provider, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Checking...' : 'Next →'}
          </button>
        </form>
      )}

      {/* Step 2: API */}
      {step === 2 && (
        <form onSubmit={handleAPISubmit} className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6">Step 2: API Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                API Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={api.name}
                onChange={(e) => setApi({ ...api, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Awesome API"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={10}
                maxLength={500}
                value={api.short_description}
                onChange={(e) => setApi({ ...api, short_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="One-line summary (10-500 chars)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Long Description</label>
              <textarea
                rows={4}
                value={api.long_description}
                onChange={(e) => setApi({ ...api, long_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description of your API..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={api.category}
                  onChange={(e) => setApi({ ...api, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-semibold mb-2">Pricing</label>
                <select
                  value={api.pricing}
                  onChange={(e) => setApi({ ...api, pricing: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Documentation URL</label>
              <input
                type="url"
                value={api.contract_url}
                onChange={(e) => setApi({ ...api, contract_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://docs.example.com/api"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Auth Type</label>
              <select
                value={api.auth_type}
                onChange={(e) => setApi({ ...api, auth_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="apikey">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="oauth2">OAuth 2.0</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Auth Instructions</label>
              <textarea
                rows={2}
                value={api.auth_instructions}
                onChange={(e) => setApi({ ...api, auth_instructions: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How to authenticate with your API..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Tags <span className="text-gray-500 text-xs">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={api.tags}
                onChange={(e) => setApi({ ...api, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="weather, forecast, climate"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit API'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
