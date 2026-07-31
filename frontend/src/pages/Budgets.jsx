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
  if (extension === 'docx') return 'DOCX'
  if (['txt', 'csv', 'json', 'md', 'xml', 'html'].includes(extension) || type.startsWith('text/')) return 'Texto'
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

export function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [readPreview, setReadPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')

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
        fetchDocuments()
      } catch (error) {
        console.error('Erro:', error)
      }
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  const selectedKind = selectedDocument ? getDocumentKind(selectedDocument) : ''
  const selectedType = selectedDocument?.file_type || ''
  const canShowImage = selectedType.startsWith('image/') || selectedKind === 'Imagem'
  const canShowPdf = selectedType.includes('pdf') || selectedKind === 'PDF'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">📄 Documentos</h1>
        <Button onClick={() => setShowModal(true)}>➕ Upload</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => {
            const fileName = normalizeDocumentText(doc.file_name)
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
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(doc)}>Visualizar</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>Baixar</Button>
                  <Button size="sm" variant="danger" className="col-span-2" onClick={() => handleDelete(doc.id)}>Deletar</Button>
                </div>
              </div>
            )
          })}
        </div>
        {documents.length === 0 ? <div className="py-10 text-center text-slate-500">Nenhum documento enviado.</div> : null}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload de Documento">
        <input type="file" onChange={handleFileUpload} className="w-full" />
        <p className="mt-3 text-sm text-slate-500">PDF, DOCX, imagens e arquivos de texto podem ser pré-visualizados ou lidos no sistema.</p>
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
