import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (token && userData) {
        setUser(JSON.parse(userData))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      try {
        const response = await api.get('/auth/setup-status')
        setNeedsSetup(Boolean(response.data.needs_setup))
      } catch (error) {
        console.error('Erro ao verificar setup:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser(user)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erro ao fazer login' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser(user)
      setNeedsSetup(false)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erro ao registrar' }
    }
  }

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser(user)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Erro ao trocar senha' }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, needsSetup, login, logout, register, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}
