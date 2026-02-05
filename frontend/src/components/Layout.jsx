import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Layout({ children }) {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  
  const isActive = (path) => location.pathname === path

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
                <Link 
                  to="/browse" 
                  className={`px-4 py-2 rounded transition ${
                    isDark 
                      ? `hover:bg-slate-800 ${isActive('/browse') ? 'bg-slate-800' : ''}` 
                      : `hover:bg-gray-100 ${isActive('/browse') ? 'bg-gray-100' : ''}`
                  }`}
                >
                  Browse
                </Link>
                <Link 
                  to="/docs" 
                  className={`px-4 py-2 rounded transition ${
                    isDark 
                      ? `hover:bg-slate-800 ${isActive('/docs') ? 'bg-slate-800' : ''}` 
                      : `hover:bg-gray-100 ${isActive('/docs') ? 'bg-gray-100' : ''}`
                  }`}
                >
                  Docs
                </Link>
                <Link 
                  to="/stats" 
                  className={`px-4 py-2 rounded transition ${
                    isDark 
                      ? `hover:bg-slate-800 ${isActive('/stats') ? 'bg-slate-800' : ''}` 
                      : `hover:bg-gray-100 ${isActive('/stats') ? 'bg-gray-100' : ''}`
                  }`}
                >
                  Stats
                </Link>
                <Link 
                  to="/submit" 
                  className={`px-4 py-2 rounded transition ${
                    isDark 
                      ? `hover:bg-slate-800 ${isActive('/submit') ? 'bg-slate-800' : ''}` 
                      : `hover:bg-gray-100 ${isActive('/submit') ? 'bg-gray-100' : ''}`
                  }`}
                >
                  Submit
                </Link>
              </nav>
              
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
            {' '} • Built for OpenClaw agents
          </p>
        </div>
      </footer>
    </div>
  )
}
