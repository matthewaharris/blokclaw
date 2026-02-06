import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated, logout } = useAuth()
  const adminToken = localStorage.getItem('adminToken')

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinkClass = (path) =>
    `px-4 py-2 rounded transition ${
      isDark
        ? `hover:bg-slate-800 ${isActive(path) ? 'bg-slate-800' : ''}`
        : `hover:bg-gray-100 ${isActive(path) ? 'bg-gray-100' : ''}`
    }`

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-gray-200'} border-b ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/blokclaw_transparent.png"
                alt="BlokClaw"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BlokClaw</h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>AI Agent API Registry</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <nav className="flex space-x-1">
                <Link to="/browse" className={navLinkClass('/browse')}>Browse</Link>
                <Link to="/docs" className={navLinkClass('/docs')}>Docs</Link>
                <Link to="/stats" className={navLinkClass('/stats')}>Stats</Link>
                <Link to="/submit" className={navLinkClass('/submit')}>Submit</Link>
                {adminToken && (
                  <Link to="/admin" className={navLinkClass('/admin')}>Admin</Link>
                )}
              </nav>

              {/* Auth */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded text-sm transition ${
                    isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded text-sm transition ${
                    isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  Login
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                }`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-600'} border-t mt-16`}>
        <div className="container mx-auto px-4 py-6 text-center text-sm">
          <p>Open-source API registry for AI agents</p>
          <p className="mt-2">
            <a
              href="https://github.com/matthewaharris/blokclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              GitHub
            </a>
            {' '} • {' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </Link>
            {' '} • {' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
            {' '} • {' '}
            <Link to="/dmca" className="text-blue-400 hover:text-blue-300">
              DMCA
            </Link>
            {' '} • Built for OpenClaw agents
          </p>
        </div>
      </footer>
    </div>
  )
}
