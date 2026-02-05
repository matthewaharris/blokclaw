import { useState } from 'react'

export default function Submit() {
  const [formData, setFormData] = useState({
    provider_email: '',
    provider_name: '',
    provider_website: '',
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
  const [result, setResult] = useState(null)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    
    try {
      // First, register provider
      const providerResponse = await fetch('/api/v1/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.provider_email,
          name: formData.provider_name,
          website: formData.provider_website
        })
      })
      
      // Provider might already exist, that's OK
      if (!providerResponse.ok && providerResponse.status !== 409) {
        throw new Error('Failed to register provider')
      }
      
      // Register API
      const apiResponse = await fetch('/api/v1/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })
      
      if (!apiResponse.ok) {
        const error = await apiResponse.json()
        throw new Error(error.error || 'Failed to register API')
      }
      
      const data = await apiResponse.json()
      setResult({ success: true, data })
      
      // Reset form
      setFormData({
        provider_email: '',
        provider_name: '',
        provider_website: '',
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
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Submit an API</h1>
      <p className="text-gray-600 mb-6">
        Register your API to the BlokClaw registry. Submissions will be reviewed before being made public.
      </p>
      
      {result && (
        <div className={`p-4 rounded-lg mb-6 ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {result.success ? (
            <div>
              <p className="text-green-800 font-medium mb-2">✓ API registered successfully!</p>
              <a
                href={result.data.api.url}
                className="text-green-700 hover:underline text-sm"
              >
                View API →
              </a>
            </div>
          ) : (
            <p className="text-red-800">✗ {result.error}</p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Provider Info */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Provider Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Email *
              </label>
              <input
                type="email"
                name="provider_email"
                value={formData.provider_email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Name *
              </label>
              <input
                type="text"
                name="provider_name"
                value={formData.provider_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Website
              </label>
              <input
                type="url"
                name="provider_website"
                value={formData.provider_website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>
        
        <hr />
        
        {/* API Info */}
        <div>
          <h2 className="text-lg font-semibold mb-3">API Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., OpenWeather API"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description * (10-500 chars)
              </label>
              <textarea
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                required
                rows={2}
                maxLength={500}
                placeholder="Brief description of what the API does"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.short_description.length}/500
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long Description
              </label>
              <textarea
                name="long_description"
                value={formData.long_description}
                onChange={handleChange}
                rows={4}
                placeholder="Detailed description, features, use cases..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., weather, payments"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing *
                </label>
                <select
                  name="pricing"
                  value={formData.pricing}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documentation URL
              </label>
              <input
                type="url"
                name="contract_url"
                value={formData.contract_url}
                onChange={handleChange}
                placeholder="https://docs.example.com/api"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Type *
              </label>
              <select
                name="auth_type"
                value={formData.auth_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="none">None</option>
                <option value="apikey">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="oauth2">OAuth2</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Instructions
              </label>
              <textarea
                name="auth_instructions"
                value={formData.auth_instructions}
                onChange={handleChange}
                rows={2}
                placeholder="How to obtain and use authentication credentials..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., weather, forecast, data, climate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit API'}
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>For OpenClaw agents:</strong> Use the POST endpoints directly for programmatic registration:
        </p>
        <code className="text-xs block mt-2 bg-white p-2 rounded">
          POST /api/v1/providers<br />
          POST /api/v1/apis
        </code>
      </div>
    </div>
  )
}
