import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { API_BASE_URL } from '../config'

export default function Admin() {
  const { isDark } = useTheme()
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '')
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('adminToken'))
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('reports')
  const [reports, setReports] = useState([])
  const [apis, setApis] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const headers = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (loggedIn) {
      fetchData()
    }
  }, [loggedIn, tab])

  const handleLogin = (e) => {
    e.preventDefault()
    localStorage.setItem('adminToken', password)
    setAdminToken(password)
    setLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setAdminToken('')
    setLoggedIn(false)
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (tab === 'reports') {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/reports`, { headers })
        if (!res.ok) throw new Error('Unauthorized')
        const data = await res.json()
        setReports(data.reports)
      } else if (tab === 'apis') {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/apis`, { headers })
        if (!res.ok) throw new Error('Unauthorized')
        const data = await res.json()
        setApis(data.apis)
      } else if (tab === 'health') {
        const [statsRes, apisRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/admin/stats`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/admin/apis`, { headers })
        ])
        if (!statsRes.ok || !apisRes.ok) throw new Error('Unauthorized')
        setStats(await statsRes.json())
        setApis((await apisRes.json()).apis)
      }
    } catch (err) {
      setError(err.message === 'Unauthorized' ? 'Invalid admin credentials' : err.message)
      if (err.message === 'Unauthorized') {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const updateReport = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/reports/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      })
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateApi = async (slug, updates) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/apis/${slug}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      })
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const cardClass = isDark ? 'bg-slate-800' : 'bg-white'
  const inputClass = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500'
    : 'border-gray-300 focus:ring-blue-500'

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Admin Dashboard
        </h1>
        <form onSubmit={handleLogin} className={`${cardClass} rounded-lg shadow-sm p-8`}>
          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>
            Admin Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 mb-4 ${inputClass}`}
            placeholder="Enter admin secret"
          />
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Logout
        </button>
      </div>

      {error && (
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-red-900/30 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className={`flex space-x-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
        {['reports', 'apis', 'health'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              tab === t
                ? 'bg-blue-600 text-white'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>Loading...</p>
        </div>
      ) : (
        <>
          {/* Reports Tab */}
          {tab === 'reports' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className={`${cardClass} rounded-lg shadow-sm p-8 text-center`}>
                  <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>No reports found</p>
                </div>
              ) : reports.map(report => (
                <div key={report.id} className={`${cardClass} rounded-lg shadow-sm p-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {report.api_name || 'Unknown API'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                          {report.reason}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {report.description}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        {report.reporter_type} • {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => updateReport(report.id, 'resolved')}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => updateReport(report.id, 'dismissed')}
                          className={`px-3 py-1 text-xs rounded transition ${
                            isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* APIs Tab */}
          {tab === 'apis' && (
            <div className="space-y-3">
              {apis.map(api => (
                <div key={api.id} className={`${cardClass} rounded-lg shadow-sm p-4 flex items-center justify-between`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {api.name}
                      </span>
                      {api.verified && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Verified</span>
                      )}
                      {!api.active && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Inactive</span>
                      )}
                      {api.health_status && api.health_status !== 'unknown' && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          api.health_status === 'healthy' ? 'bg-green-100 text-green-700' :
                          api.health_status === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {api.health_status}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {api.provider_name} • {api.category} • {api.view_count} views
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateApi(api.slug, { verified: !api.verified })}
                      className={`px-3 py-1 text-xs rounded transition ${
                        api.verified
                          ? isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {api.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => updateApi(api.slug, { active: !api.active })}
                      className={`px-3 py-1 text-xs rounded transition ${
                        api.active
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {api.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Health Tab */}
          {tab === 'health' && (
            <div>
              {stats && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
                    <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {stats.unhealthy_apis}
                    </div>
                    <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>Unhealthy APIs</div>
                  </div>
                  <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
                    <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {stats.reports?.pending || 0}
                    </div>
                    <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>Pending Reports</div>
                  </div>
                  <div className={`${cardClass} rounded-lg shadow-sm p-6`}>
                    <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      {stats.unverified_providers}
                    </div>
                    <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>Unverified Providers</div>
                  </div>
                </div>
              )}

              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                API Health Status
              </h2>
              <div className="space-y-3">
                {apis.filter(a => a.active).map(api => (
                  <div key={api.id} className={`${cardClass} rounded-lg shadow-sm p-4 flex items-center justify-between`}>
                    <div>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {api.name}
                      </span>
                      <span className={`ml-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {api.category}
                      </span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      api.health_status === 'healthy' ? 'bg-green-100 text-green-700' :
                      api.health_status === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
                      api.health_status === 'unhealthy' ? 'bg-red-100 text-red-700' :
                      isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {api.health_status || 'unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
