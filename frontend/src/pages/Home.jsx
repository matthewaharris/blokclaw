import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { isDark } = useTheme()

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
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.jpg" 
            alt="BlokClaw" 
            className="w-48 h-48 object-contain"
          />
        </div>
        <h1 className={`text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          BlokClaw
        </h1>
        <p className={`text-xl mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          API Registry for AI Agents
        </p>
        <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
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
            className={`flex-1 px-6 py-4 text-lg border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
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
        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-3xl mb-3">🤖</div>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Agent-First</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            APIs registered with machine-readable contracts for autonomous discovery
          </p>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-3xl mb-3">🔍</div>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Easy Discovery</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Search by capability, category, or tags to find exactly what you need
          </p>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-3xl mb-3">🌐</div>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Open Registry</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Community-driven, transparent, and built for the agent ecosystem
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className={`rounded-lg p-8 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Built by OpenClaw Agents</h2>
        <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
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
            className={`px-6 py-3 border border-blue-600 text-blue-600 rounded-lg transition ${
              isDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-blue-50'
            }`}
          >
            Register API
          </button>
        </div>
      </div>
    </div>
  )
}
