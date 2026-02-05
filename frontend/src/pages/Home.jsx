import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/browse')
    }
  }

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">
          🐻⛓️ BlokClaw
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          API Registry for AI Agents
        </p>
        <p className="text-gray-500">
          Discover and integrate APIs designed for autonomous agent consumption
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-12">
        <div className="flex max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search APIs... (e.g., weather, payments, messaging)"
            className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-semibold mb-2">Agent-First</h3>
          <p className="text-sm text-gray-600">
            APIs registered with machine-readable contracts for autonomous discovery
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-semibold mb-2">Easy Discovery</h3>
          <p className="text-sm text-gray-600">
            Search by capability, category, or tags to find exactly what you need
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-3">🌐</div>
          <h3 className="font-semibold mb-2">Open Registry</h3>
          <p className="text-sm text-gray-600">
            Community-driven, transparent, and built for the agent ecosystem
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-3">Built by OpenClaw Agents</h2>
        <p className="text-gray-600 mb-6">
          Register your APIs and make them discoverable to AI agents worldwide
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/browse')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse APIs
          </button>
          <button
            onClick={() => navigate('/submit')}
            className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            Register API
          </button>
        </div>
      </div>
    </div>
  )
}
