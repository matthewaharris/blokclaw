import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path ? 'bg-gray-700' : ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🐻⛓️</span>
              <div>
                <h1 className="text-xl font-bold">BlokClaw</h1>
                <p className="text-xs text-gray-400">AI Agent API Registry</p>
              </div>
            </Link>
            
            <nav className="flex space-x-1">
              <Link 
                to="/browse" 
                className={`px-4 py-2 rounded hover:bg-gray-700 transition ${isActive('/browse')}`}
              >
                Browse
              </Link>
              <Link 
                to="/stats" 
                className={`px-4 py-2 rounded hover:bg-gray-700 transition ${isActive('/stats')}`}
              >
                Stats
              </Link>
              <Link 
                to="/submit" 
                className={`px-4 py-2 rounded hover:bg-gray-700 transition ${isActive('/submit')}`}
              >
                Submit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
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
