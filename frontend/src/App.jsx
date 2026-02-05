import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import APIDetail from './pages/APIDetail'
import Stats from './pages/Stats'
import Submit from './pages/Submit'
import Docs from './pages/Docs'

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
      </Routes>
    </Layout>
  )
}

export default App
