import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return true
  return Date.now() >= payload.exp * 1000
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [provider, setProvider] = useState(() => {
    const stored = localStorage.getItem('authProvider')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout()
    }
  }, [])

  const login = (newToken, providerData) => {
    localStorage.setItem('authToken', newToken)
    localStorage.setItem('authProvider', JSON.stringify(providerData))
    setToken(newToken)
    setProvider(providerData)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authProvider')
    setToken(null)
    setProvider(null)
  }

  const isAuthenticated = !!token && !isTokenExpired(token)

  return (
    <AuthContext.Provider value={{ token, provider, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
