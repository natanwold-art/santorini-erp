import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Budgets from './pages/Budgets'
import Documents from './pages/Documents'
import Employees from './pages/Employees'
import Contracts from './pages/Contracts'
import Finance from './pages/Finance'
import Users from './pages/Users'

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext)
  return user ? children : <Navigate to="/login" />
}

function AppContent() {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clients />} />
        <Route path="/obras" element={<Projects />} />
        <Route path="/orcamentos" element={<Budgets />} />
        <Route path="/documentos" element={<Documents />} />
        <Route path="/colaboradores" element={<Employees />} />
        <Route path="/contratos" element={<Contracts />} />
        <Route path="/financeiro" element={<Finance />} />
        {user?.role === 'admin' && <Route path="/usuarios" element={<Users />} />}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
