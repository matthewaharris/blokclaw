import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import APIDetail from './pages/APIDetail'
import Stats from './pages/Stats'
import Submit from './pages/Submit'
import Docs from './pages/Docs'
import Terms from './pages/Terms'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import DMCA from './pages/DMCA'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/api/:slug" element={<APIDetail />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/dmca" element={<DMCA />} />
      </Routes>
    </Layout>
  )
}

export default App
