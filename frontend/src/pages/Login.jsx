import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config'

export default function Login() {
  const { isDark } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/providers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      login(data.token, data.provider)
      navigate('/browse')
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
    <div className="max-w-md mx-auto">
      <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Log In
      </h1>
      <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        Sign in to your provider account
      </p>

      {error && (
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-red-900/30 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${cardClass} rounded-lg shadow-sm p-8`}>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputClass}`}
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>

        <p className={`mt-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <Link to="/submit" className="text-blue-500 hover:text-blue-400">
            Register as a provider
          </Link>
        </p>
      </form>
    </div>
  )
}
