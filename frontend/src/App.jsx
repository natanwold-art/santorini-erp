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
import ChangePassword from './pages/ChangePassword'
import { canAccess, getFirstAccessiblePath } from './utils/permissions'

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext)
  return user ? children : <Navigate to="/login" />
}

function AppContent() {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-600">Carregando...</div>
  }

  if (!user) {
    return <Login />
  }

  if (user.must_change_password) {
    return <ChangePassword />
  }

  const PermissionRoute = ({ permission, children }) => (
    canAccess(user, permission) ? children : <Navigate to={getFirstAccessiblePath(user)} />
  )

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PermissionRoute permission="dashboard"><Dashboard /></PermissionRoute>} />
        <Route path="/clientes" element={<PermissionRoute permission="clients"><Clients /></PermissionRoute>} />
        <Route path="/obras" element={<PermissionRoute permission="projects"><Projects /></PermissionRoute>} />
        <Route path="/orcamentos" element={<PermissionRoute permission="budgets"><Budgets /></PermissionRoute>} />
        <Route path="/documentos" element={<PermissionRoute permission="documents"><Documents /></PermissionRoute>} />
        <Route path="/colaboradores" element={<PermissionRoute permission="employees"><Employees /></PermissionRoute>} />
        <Route path="/contratos" element={<PermissionRoute permission="contracts"><Contracts /></PermissionRoute>} />
        <Route path="/financeiro" element={<PermissionRoute permission="finance"><Finance /></PermissionRoute>} />
        {user?.role === 'admin' && <Route path="/usuarios" element={<Users />} />}
        <Route path="*" element={<Navigate to={getFirstAccessiblePath(user)} />} />
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
