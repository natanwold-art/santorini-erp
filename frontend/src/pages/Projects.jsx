import React, { useState, useEffect } from 'react'
import { Card, Button, Modal, Input } from '../components/UI'
import api from '../services/api'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    address: '',
    address_number: '',
    city: '',
    responsible: '',
    start_date: '',
    end_date_forecast: '',
    budget: '',
    observations: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/clients'),
      ])
      setProjects(projectsRes.data)
      setClients(clientsRes.data)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
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
        await api.put(`/projects/${editingId}`, formData)
      } else {
        await api.post('/projects', formData)
      }
      fetchData()
      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar obra:', error)
      alert('Erro ao salvar obra')
    }
  }

  const handleEdit = (project) => {
    setFormData(project)
    setEditingId(project.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`)
      fetchData()
    } catch (error) {
      console.error('Erro ao deletar obra:', error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      client_id: '',
      name: '',
      address: '',
      address_number: '',
      city: '',
      responsible: '',
      start_date: '',
      end_date_forecast: '',
      budget: '',
      observations: '',
    })
  }

  const statusLabels = {
    planned: '📅 Planejada',
    in_progress: '⚙️ Em Andamento',
    paused: '⏸️ Pausada',
    finished: '✅ Finalizada',
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Obras</h1>
        <Button onClick={() => setShowModal(true)}>➕ Nova Obra</Button>
      </div>

      <Card>
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">Todos os Status</option>
            <option value="planned">Planejada</option>
            <option value="in_progress">Em Andamento</option>
            <option value="paused">Pausada</option>
            <option value="finished">Finalizada</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-primary">{project.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {statusLabels[project.status]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{project.address}, {project.city}</p>
              <p className="text-sm mb-1">
                <strong>Cliente:</strong> {project.client_name}
              </p>
              <p className="text-sm mb-1">
                <strong>Responsável:</strong> {project.responsible || '—'}
              </p>
              <p className="text-sm mb-3">
                <strong>Orçamento:</strong> R$ {project.budget?.toFixed(2) || '—'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('Deletar esta obra?')) handleDelete(project.id)
                  }}
                  className="flex-1 px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">Nenhuma obra encontrada</div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Editar Obra' : 'Nova Obra'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Cliente *</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Nome da Obra *" name="name" value={formData.name} onChange={handleInputChange} required />
          <Input label="Endereço *" name="address" value={formData.address} onChange={handleInputChange} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nº" name="address_number" value={formData.address_number} onChange={handleInputChange} />
            <Input label="Cidade" name="city" value={formData.city} onChange={handleInputChange} />
          </div>
          <Input label="Responsável" name="responsible" value={formData.responsible} onChange={handleInputChange} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Data Início"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
            />
            <Input
              label="Previsão Término"
              type="date"
              name="end_date_forecast"
              value={formData.end_date_forecast}
              onChange={handleInputChange}
            />
          </div>
          <Input
            label="Orçamento"
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            step="0.01"
          />
          <textarea
            name="observations"
            placeholder="Observações"
            value={formData.observations}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows="3"
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 justify-center">
              ✅ Salvar
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1 justify-center">
              ✕ Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
