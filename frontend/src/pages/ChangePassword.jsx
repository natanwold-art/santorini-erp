import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function ChangePassword() {
  const { user, changePassword, logout } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('A confirmação não confere com a nova senha.')
      return
    }

    setLoading(true)
    const result = await changePassword(formData.currentPassword, formData.newPassword, formData.confirmPassword)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-blue-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-primary">Trocar senha</h1>
          <p className="text-gray-600">Olá, {user?.name || 'usuário'}. Crie sua senha pessoal para continuar.</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block font-semibold text-gray-700">Senha atual</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              placeholder="Senha provisória"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">Nova senha</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">Confirmar nova senha</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              placeholder="Repita a nova senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <button onClick={logout} className="mt-5 w-full text-sm font-semibold text-gray-500 hover:text-primary">
          Sair e trocar depois
        </button>
      </div>
    </div>
  )
}
