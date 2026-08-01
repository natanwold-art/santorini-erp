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
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operational',
    active: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'operational',
      active: true,
    })
    setShowModal(true)
  }

  const openEditModal = (user) => {
    setEditingId(user.id)
    setError('')
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'operational',
      active: user.active === true || user.active === 1,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!editingId && !formData.password.trim()) {
      setError('Informe uma senha para criar o usuário.')
      return
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      active: formData.active,
    }

    if (!editingId) {
      payload.password = formData.password
    }

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, payload)
      } else {
        await api.post('/users', payload)
      }

      await fetchUsers()
      setShowModal(false)
    } catch (error) {
      setError(error.response?.data?.error || 'Não foi possível salvar o usuário.')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Desativar usuário?')) {
      try {
        await api.delete(`/users/${id}`)
        fetchUsers()
      } catch (error) {
        alert(error.response?.data?.error || 'Erro ao desativar usuário')
      }
    }
  }

  const roleLabel = {
    admin: 'Admin',
    financial: 'Financeiro',
    operational: 'Operacional',
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">🔐 Usuários</h1>
        <Button onClick={openCreateModal}>➕ Novo</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-primary">
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Papel</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{roleLabel[user.role] || user.role}</td>
                  <td className="px-4 py-3">{user.active === true || user.active === 1 ? 'Ativo' : 'Inativo'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>Desativar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="text-center py-8 text-gray-500">Nenhum usuário cadastrado</div>}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Editar usuário' : 'Novo usuário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          <Input label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          {!editingId ? (
            <Input label="Senha" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          ) : null}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Papel</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100">
              <option value="admin">Admin</option>
              <option value="financial">Financeiro</option>
              <option value="operational">Operacional</option>
            </select>
          </div>
          {editingId ? (
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
              Usuário ativo
            </label>
          ) : null}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 justify-center">Salvar</Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1 justify-center">Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

const MOJIBAKE_REPLACEMENTS = [
  ['Ã‡', 'Ç'],
  ['Ã§', 'ç'],
  ['Ã£', 'ã'],
  ['Ã¡', 'á'],
  ['Ã¢', 'â'],
  ['Ãª', 'ê'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ã´', 'ô'],
  ['Ãµ', 'õ'],
  ['Ãº', 'ú'],
  ['Ã�', 'Á'],
  ['Ã‰', 'É'],
  ['Ã“', 'Ó'],
  ['â€“', '-'],
  ['â€”', '-'],
  ['Âº', 'º'],
  ['Âª', 'ª'],
]

const normalizeDocumentText = (value = '') => {
  let text = String(value || '')
  for (const [broken, fixed] of MOJIBAKE_REPLACEMENTS) {
    text = text.replaceAll(broken, fixed)
  }
  return text
}

const getDocumentExtension = (fileName = '') => {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

const formatFileSize = (bytes = 0) => {
  const size = Number(bytes || 0)
  if (!size) return 'Tamanho indisponível'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getDocumentKind = (doc) => {
  const extension = getDocumentExtension(doc.file_name)
  const type = doc.file_type || ''
  if (type.includes('pdf') || extension === 'pdf') return 'PDF'
  if (type.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return 'Imagem'
  if (type.includes('video') || ['mp4', 'webm', 'mov'].includes(extension)) return 'Vídeo'
  if (extension === 'docx') return 'DOCX'
  if (['txt', 'csv', 'json', 'md', 'xml', 'html'].includes(extension) || type.startsWith('text/')) return 'Texto'
  if (extension === 'zip') return 'ZIP'
  return extension ? extension.toUpperCase() : 'Arquivo'
}

const getCategoryLabel = (category) => ({
  contract: 'Contrato',
  rg: 'RG',
  cpf: 'CPF',
  nr: 'NR',
  proof: 'Comprovante',
  budget: 'Orçamento',
  other: 'Outro',
}[category] || normalizeDocumentText(category || 'Outro'))

const getObservationValue = (observations = '', label) => {
  const line = String(observations || '')
    .split('\n')
    .find((item) => item.startsWith(`${label}:`))

  return line ? normalizeDocumentText(line.slice(label.length + 1).trim()) : ''
}

const getDocumentImportInfo = (doc) => ({
  folder: getObservationValue(doc.observations, 'Pasta'),
  order: getObservationValue(doc.observations, 'Ordem na pasta'),
  origin: getObservationValue(doc.observations, 'Origem'),
})

const ROOT_FOLDER_ID = ''

const buildFolderPath = (folders, folderId) => {
  const byId = new Map(folders.map((folder) => [folder.id, folder]))
  const path = []
  let current = byId.get(folderId)
  let guard = 0

  while (current && guard < 20) {
    path.unshift(current)
    current = current.parent_id ? byId.get(current.parent_id) : null
    guard += 1
  }

  return path
}

const getFolderLabel = (folders, folder) => {
  const path = buildFolderPath(folders, folder.id)
  return path.map((item) => normalizeDocumentText(item.name)).join(' / ')
}

export function Documents() {
  const [documents, setDocuments] = useState([])
  const [folders, setFolders] = useState([])
  const [allFolders, setAllFolders] = useState([])
  const [currentFolderId, setCurrentFolderId] = useState(ROOT_FOLDER_ID)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadFolderId, setUploadFolderId] = useState(ROOT_FOLDER_ID)
  const [movingDocument, setMovingDocument] = useState(null)
  const [moveFolderId, setMoveFolderId] = useState(ROOT_FOLDER_ID)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [readPreview, setReadPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')

  useEffect(() => {
    fetchFolderView()
  }, [currentFolderId])

  const fetchFolderView = async () => {
    try {
      setLoading(true)
      const folderParam = currentFolderId || 'root'
      const [documentsResponse, foldersResponse, allFoldersResponse] = await Promise.all([
        api.get('/documents', { params: { folder_id: folderParam } }),
        api.get('/documents/folders', { params: { parent_id: folderParam } }),
        api.get('/documents/folders', { params: { all: 1 } }),
      ])

      setDocuments(documentsResponse.data)
      setFolders(foldersResponse.data)
      setAllFolders(allFoldersResponse.data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const openUploadModal = () => {
    setUploadFile(null)
    setUploadFolderId(currentFolderId)
    setShowModal(true)
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadFile) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', uploadFile)
    formDataUpload.append('category', 'other')
    formDataUpload.append('folder_id', uploadFolderId || '')

    try {
      await api.post('/documents/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      fetchFolderView()
      setShowModal(false)
      setUploadFile(null)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
    }
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    const name = newFolderName.trim()
    if (!name) return

    try {
      await api.post('/documents/folders', {
        name,
        parent_id: currentFolderId || null,
      })
      setNewFolderName('')
      setShowFolderModal(false)
      fetchFolderView()
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar pasta')
    }
  }

  const handleDeleteFolder = async (folder) => {
    if (confirm(`Deletar a pasta "${normalizeDocumentText(folder.name)}"? Ela precisa estar vazia.`)) {
      try {
        await api.delete(`/documents/folders/${folder.id}`)
        fetchFolderView()
      } catch (error) {
        alert(error.response?.data?.error || 'Erro ao deletar pasta')
      }
    }
  }

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
    setReadPreview(null)
    setSelectedDocument(null)
    setPreviewError('')
  }

  const handlePreview = async (doc) => {
    closePreview()
    setSelectedDocument(doc)
    setPreviewLoading(true)

    try {
      const [fileResponse, readResponse] = await Promise.all([
        api.get(`/documents/file/${doc.id}`, { responseType: 'blob' }),
        api.get(`/documents/read/${doc.id}`).catch((error) => ({ error })),
      ])

      const contentType = fileResponse.headers['content-type'] || doc.file_type || 'application/octet-stream'
      const blob = new Blob([fileResponse.data], { type: contentType })
      setPreviewUrl(URL.createObjectURL(blob))

      if (!readResponse.error) {
        setReadPreview(readResponse.data)
      }
    } catch (error) {
      console.error('Erro ao carregar pré-visualização:', error)
      setPreviewError('Não foi possível carregar a pré-visualização deste arquivo.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/download/${doc.id}`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = normalizeDocumentText(doc.file_name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar documento:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Deletar documento?')) {
      try {
        await api.delete(`/documents/${id}`)
        fetchFolderView()
      } catch (error) {
        console.error('Erro:', error)
      }
    }
  }

  const openMoveModal = (doc) => {
    setMovingDocument(doc)
    setMoveFolderId(doc.folder_id || ROOT_FOLDER_ID)
  }

  const handleMoveDocument = async (e) => {
    e.preventDefault()
    if (!movingDocument) return

    try {
      await api.patch(`/documents/${movingDocument.id}/folder`, {
        folder_id: moveFolderId || null,
      })
      setMovingDocument(null)
      fetchFolderView()
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao mover documento')
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  const selectedKind = selectedDocument ? getDocumentKind(selectedDocument) : ''
  const selectedType = selectedDocument?.file_type || ''
  const canShowImage = selectedType.startsWith('image/') || selectedKind === 'Imagem'
  const canShowPdf = selectedType.includes('pdf') || selectedKind === 'PDF'
  const canShowVideo = selectedType.startsWith('video/') || selectedKind === 'Vídeo'
  const selectedImportInfo = selectedDocument ? getDocumentImportInfo(selectedDocument) : null
  const selectedFolderName = selectedDocument?.folder_name || selectedImportInfo?.folder
  const currentFolderPath = buildFolderPath(allFolders, currentFolderId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">📄 Documentos</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <button type="button" onClick={() => setCurrentFolderId(ROOT_FOLDER_ID)} className="font-semibold text-primary-700 hover:text-primary-900">Raiz</button>
            {currentFolderPath.map((folder) => (
              <React.Fragment key={folder.id}>
                <span>/</span>
                <button type="button" onClick={() => setCurrentFolderId(folder.id)} className="font-semibold text-primary-700 hover:text-primary-900">
                  {normalizeDocumentText(folder.name)}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentFolderId ? <Button variant="outline" onClick={() => setCurrentFolderId(currentFolderPath.at(-2)?.id || ROOT_FOLDER_ID)}>Voltar</Button> : null}
          <Button variant="outline" onClick={() => setShowFolderModal(true)}>Nova pasta</Button>
          <Button onClick={openUploadModal}>➕ Upload</Button>
        </div>
      </div>

      <Card>
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {folders.map((folder) => (
            <div key={folder.id} className="flex min-h-[132px] flex-col rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:-translate-y-0.5 hover:shadow-card">
              <button type="button" onClick={() => setCurrentFolderId(folder.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-base font-bold text-slate-950" title={normalizeDocumentText(folder.name)}>{normalizeDocumentText(folder.name)}</p>
                <p className="mt-2 text-sm text-amber-800">{Number(folder.document_count || 0)} documentos</p>
                <p className="text-sm text-amber-800">{Number(folder.child_count || 0)} pastas</p>
              </button>
              <Button size="sm" variant="ghost" className="mt-3 self-start" onClick={() => handleDeleteFolder(folder)}>Deletar pasta</Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => {
            const fileName = normalizeDocumentText(doc.file_name)
            const importInfo = getDocumentImportInfo(doc)
            const folderName = doc.folder_name || importInfo.folder
            return (
              <div key={doc.id} className="flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950" title={fileName}>{fileName}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{getDocumentKind(doc)}</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">{getCategoryLabel(doc.category)}</span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                  <p>{formatFileSize(doc.file_size)}</p>
                  <p className="truncate">{doc.client_name || doc.project_name || doc.employee_name || 'Sem vínculo'}</p>
                  {folderName ? <p className="truncate" title={folderName}>Pasta: {folderName}</p> : null}
                  {importInfo.order ? <p>Ordem na pasta: {importInfo.order}</p> : null}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(doc)}>Visualizar</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>Baixar</Button>
                  <Button size="sm" variant="outline" onClick={() => openMoveModal(doc)}>Mover</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(doc.id)}>Deletar</Button>
                </div>
              </div>
            )
          })}
        </div>
        {documents.length === 0 && folders.length === 0 ? <div className="py-10 text-center text-slate-500">Nenhum documento enviado nesta pasta.</div> : null}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload de Documento">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Pasta</label>
            <select value={uploadFolderId} onChange={(e) => setUploadFolderId(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100">
              <option value="">Raiz</option>
              {allFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>{getFolderLabel(allFolders, folder)}</option>
              ))}
            </select>
          </div>
          <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full" />
          <p className="text-sm text-slate-500">PDF, DOCX, imagens e arquivos de texto podem ser pré-visualizados ou lidos no sistema.</p>
          <Button type="submit" className="w-full" disabled={!uploadFile}>Enviar documento</Button>
        </form>
      </Modal>

      <Modal isOpen={showFolderModal} onClose={() => setShowFolderModal(false)} title="Nova pasta">
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <Input label="Nome da pasta" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} autoFocus />
          <p className="text-sm text-slate-500">A pasta será criada dentro de {currentFolderPath.length ? normalizeDocumentText(currentFolderPath.at(-1).name) : 'Raiz'}.</p>
          <Button type="submit" className="w-full">Criar pasta</Button>
        </form>
      </Modal>

      <Modal isOpen={!!movingDocument} onClose={() => setMovingDocument(null)} title="Mover documento">
        <form onSubmit={handleMoveDocument} className="space-y-4">
          <p className="text-sm font-semibold text-slate-700">{movingDocument ? normalizeDocumentText(movingDocument.file_name) : ''}</p>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Nova pasta</label>
            <select value={moveFolderId} onChange={(e) => setMoveFolderId(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100">
              <option value="">Raiz</option>
              {allFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>{getFolderLabel(allFolders, folder)}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">Mover documento</Button>
        </form>
      </Modal>

      <Modal isOpen={!!selectedDocument} onClose={closePreview} title={selectedDocument ? normalizeDocumentText(selectedDocument.file_name) : 'Documento'} size="full">
        {previewLoading ? (
          <div className="py-16 text-center text-slate-500">Carregando pré-visualização...</div>
        ) : previewError ? (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{previewError}</div>
        ) : selectedDocument ? (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {canShowPdf && previewUrl ? (
                <iframe title="Pré-visualização PDF" src={previewUrl} className="h-[72vh] w-full" />
              ) : canShowImage && previewUrl ? (
                <div className="grid min-h-[520px] place-items-center p-4">
                  <img src={previewUrl} alt={normalizeDocumentText(selectedDocument.file_name)} className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-card" />
                </div>
              ) : canShowVideo && previewUrl ? (
                <div className="grid min-h-[520px] place-items-center bg-black p-4">
                  <video src={previewUrl} controls className="max-h-[70vh] max-w-full rounded-xl" />
                </div>
              ) : readPreview?.supported ? (
                <pre className="max-h-[72vh] overflow-auto whitespace-pre-wrap p-5 text-sm leading-6 text-slate-700">{readPreview.text || 'Arquivo sem texto extraído.'}</pre>
              ) : (
                <div className="grid min-h-[520px] place-items-center p-6 text-center text-slate-500">
                  <div>
                    <p className="text-lg font-bold text-slate-700">Pré-visualização visual indisponível</p>
                    <p className="mt-2 text-sm">Use a leitura textual quando disponível ou baixe o arquivo.</p>
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-base font-bold text-slate-950">Leitura do arquivo</h3>
              <p className="mt-1 text-sm text-slate-500">Extração de texto para PDF pesquisável, DOCX e arquivos de texto.</p>
              {selectedFolderName ? (
                <div className="mt-4 rounded-xl bg-primary-50 p-3 text-sm text-primary-800">
                  <p className="font-semibold">Pasta: {selectedFolderName}</p>
                  {selectedImportInfo.order ? <p>Ordem na pasta: {selectedImportInfo.order}</p> : null}
                  {selectedImportInfo.origin ? <p className="mt-1 break-words text-xs text-primary-700">Origem: {selectedImportInfo.origin}</p> : null}
                </div>
              ) : null}
              <div className="mt-4 max-h-[56vh] overflow-auto rounded-xl bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{readPreview?.text || 'Texto não disponível para este formato.'}</pre>
              </div>
              <Button className="mt-4 w-full" variant="outline" onClick={() => handleDownload(selectedDocument)}>Baixar arquivo original</Button>
            </aside>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Budgets
