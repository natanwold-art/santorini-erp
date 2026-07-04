import React, { useState, useEffect } from 'react'
import { Card, Button, Modal, Input } from '../components/UI'
import api from '../services/api'

const PlaceholderPage = ({ title, endpoint, fields, icon }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get(endpoint)
      setData(response.data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, formData)
      } else {
        await api.post(endpoint, formData)
      }
      fetchData()
      setShowModal(false)
      setEditingId(null)
      setFormData({})
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await api.delete(`${endpoint}/${id}`)
        fetchData()
      } catch (error) {
        console.error('Erro:', error)
      }
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">{icon} {title}</h1>
        <Button onClick={() => { setEditingId(null); setFormData({}); setShowModal(true) }}>
          ➕ Novo
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-primary">
                {fields.map((f) => (
                  <th key={f.key} className="px-4 py-3 text-left font-semibold">{f.label}</th>
                ))}
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  {fields.map((f) => (
                    <td key={f.key} className="px-4 py-3">
                      {item[f.key] || '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => { setFormData(item); setEditingId(item.id); setShowModal(true) }}
                      className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && <div className="text-center py-8 text-gray-500">Nenhum registro</div>}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Editar' : 'Novo'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              name={f.key}
              type={f.type || 'text'}
              value={formData[f.key] || ''}
              onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
            />
          ))}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 justify-center">✅ Salvar</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1 justify-center">✕ Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export function Budgets() {
  return <PlaceholderPage
    title="Orçamentos"
    icon="📋"
    endpoint="/budgets"
    fields={[
      { key: 'service_type', label: 'Tipo de Serviço' },
      { key: 'square_meters', label: 'Metragem', type: 'number' },
      { key: 'value_per_meter', label: 'Valor/m²', type: 'number' },
      { key: 'total_value', label: 'Total' },
      { key: 'status', label: 'Status' },
    ]}
  />
}

export function Employees() {
  return <PlaceholderPage
    title="Colaboradores"
    icon="👷"
    endpoint="/employees"
    fields={[
      { key: 'name', label: 'Nome' },
      { key: 'cpf', label: 'CPF' },
      { key: 'position', label: 'Cargo' },
      { key: 'phone', label: 'Telefone' },
      { key: 'status', label: 'Status' },
    ]}
  />
}

export function Contracts() {
  return <PlaceholderPage
    title="Contratos"
    icon="📑"
    endpoint="/contracts"
    fields={[
      { key: 'contract_number', label: 'Nº Contrato' },
      { key: 'value', label: 'Valor', type: 'number' },
      { key: 'start_date', label: 'Data Início', type: 'date' },
      { key: 'status', label: 'Status' },
    ]}
  />
}

export function Finance() {
  return <PlaceholderPage
    title="Financeiro"
    icon="💰"
    endpoint="/finance"
    fields={[
      { key: 'type', label: 'Tipo' },
      { key: 'description', label: 'Descrição' },
      { key: 'value', label: 'Valor', type: 'number' },
      { key: 'date', label: 'Data', type: 'date' },
      { key: 'category', label: 'Categoria' },
    ]}
  />
}

export function Users() {
  return <PlaceholderPage
    title="Usuários"
    icon="🔐"
    endpoint="/users"
    fields={[
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'role', label: 'Papel' },
      { key: 'active', label: 'Ativo' },
    ]}
  />
}

export function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents')
      setDocuments(response.data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('category', 'other')

    try {
      await api.post('/documents/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      fetchDocuments()
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Deletar documento?')) {
      try {
        await api.delete(`/documents/${id}`)
        fetchDocuments()
      } catch (error) {
        console.error('Erro:', error)
      }
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">📄 Documentos</h1>
        <Button onClick={() => setShowModal(true)}>➕ Upload</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <p className="font-semibold truncate">{doc.file_name}</p>
              <p className="text-sm text-gray-500 mb-2">{doc.category}</p>
              <button
                onClick={() => handleDelete(doc.id)}
                className="w-full px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Deletar
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload de Documento">
        <input type="file" onChange={handleFileUpload} className="w-full" />
      </Modal>
    </div>
  )
}

export default Budgets
