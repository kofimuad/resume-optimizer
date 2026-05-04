import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Success from './pages/Success.jsx'

function App() {
  return (
    <div className="text-slate-900 antialiased">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </div>
  )
}

export default App
