import React, { useState, useEffect } from 'react'
import { Card, Button, Modal, Input } from '../components/UI'
import api from '../services/api'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    cpf_cnpj: '',
    phone: '',
    email: '',
    address: '',
    address_number: '',
    city: '',
    state: '',
    observations: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/clients')
      setClients(response.data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData)
      } else {
        await api.post('/clients', formData)
      }

      fetchClients()
      setShowModal(false)
      setEditingId(null)
      setFormData({
        name: '',
        cpf_cnpj: '',
        phone: '',
        email: '',
        address: '',
        address_number: '',
        city: '',
        state: '',
        observations: '',
      })
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      alert('Erro ao salvar cliente')
    }
  }

  const handleEdit = (client) => {
    setFormData(client)
    setEditingId(client.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}`)
      fetchClients()
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      alert('Erro ao deletar cliente')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      name: '',
      cpf_cnpj: '',
      phone: '',
      email: '',
      address: '',
      address_number: '',
      city: '',
      state: '',
      observations: '',
    })
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf_cnpj?.includes(searchTerm)
  )

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Clientes</h1>
        <Button onClick={() => setShowModal(true)}>➕ Novo Cliente</Button>
      </div>

      <Card>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-primary">
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">CPF/CNPJ</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Telefone</th>
                <th className="px-4 py-3 text-left font-semibold">Cidade</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{client.name}</td>
                  <td className="px-4 py-3">{client.cpf_cnpj}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3">{client.city}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja deletar este cliente?')) {
                          handleDelete(client.id)
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado</div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Nome *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="CPF/CNPJ"
            name="cpf_cnpj"
            value={formData.cpf_cnpj}
            onChange={handleInputChange}
            placeholder="000.000.000-00"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            label="Telefone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(00) 00000-0000"
          />
          <Input
            label="Endereço"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Número"
              name="address_number"
              value={formData.address_number}
              onChange={handleInputChange}
            />
            <Input
              label="Cidade"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          <Input
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="SP"
          />
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Observações</label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              rows="3"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 justify-center">
              {editingId ? '💾 Atualizar' : '✅ Criar'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1 justify-center"
            >
              ✕ Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
