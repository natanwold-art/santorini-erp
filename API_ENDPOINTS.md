# 📡 Endpoints da API - Santorini ERP

Base URL: `http://localhost:3000/api`

Todos os endpoints (exceto auth) requerem header:
```
Authorization: Bearer <TOKEN>
```

## 🔐 Autenticação

### POST `/auth/register`
Registrar novo usuário
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "senha123"
}
```
Retorna: Token JWT e dados do usuário

### POST `/auth/login`
Fazer login
```json
{
  "email": "john@example.com",
  "password": "senha123"
}
```
Retorna: Token JWT

### POST `/auth/validate-token`
Validar token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 👥 Clientes

### GET `/clients`
Listar todos os clientes ativos
```
Retorna: Array de clientes
```

### GET `/clients/:id`
Obter cliente específico
```
Retorna: { id, name, cpf_cnpj, phone, email, address, ..., documents, projects }
```

### GET `/clients/search?query=texto`
Buscar clientes
```
Busca por: name, email, cpf_cnpj, phone
Retorna: Array de clientes (máx 20)
```

### POST `/clients`
Criar novo cliente
```json
{
  "name": "Empresa XYZ",
  "cpf_cnpj": "12.345.678/0001-90",
  "phone": "(11) 99999-9999",
  "email": "contato@xyz.com",
  "address": "Rua Exemplo",
  "address_number": "123",
  "address_complement": "Apto 456",
  "city": "São Paulo",
  "state": "SP",
  "postal_code": "01234-567",
  "observations": "..."
}
```

### PUT `/clients/:id`
Atualizar cliente

### DELETE `/clients/:id`
Deletar cliente (soft delete - marca como inativo)

---

## 🏗️ Obras/Projetos

### GET `/projects`
Listar todas as obras
```
Retorna: Array com client_name incluído
```

### GET `/projects/:id`
Obter obra específica
```
Retorna: { ..., client_name, documents, finance }
```

### GET `/projects/status/:status?query=value`
Listar obras por status
```
Status: planned, in_progress, paused, finished
```

### POST `/projects`
Criar nova obra
```json
{
  "client_id": "uuid",
  "name": "Reforma Comercial",
  "address": "Rua Exemplo",
  "address_number": "100",
  "address_complement": "",
  "city": "São Paulo",
  "state": "SP",
  "postal_code": "01234-567",
  "responsible": "Carlos Silva",
  "start_date": "2024-01-15",
  "end_date_forecast": "2024-03-15",
  "budget": 50000,
  "observations": "..."
}
```

### PUT `/projects/:id`
Atualizar obra
```json
{
  "name": "...",
  "status": "in_progress",
  "cost": 35000,
  ...
}
```

### DELETE `/projects/:id`
Deletar obra

---

## 📋 Orçamentos

### GET `/budgets`
Listar todos os orçamentos
```
Retorna: Array com client_name
```

### GET `/budgets/:id`
Obter orçamento específico

### GET `/budgets/status/:status`
Listar por status: analysis, approved, rejected

### POST `/budgets`
Criar orçamento
```json
{
  "client_id": "uuid",
  "service_type": "Pintura",
  "square_meters": 150,
  "value_per_meter": 50,
  "observations": "..."
}
```
Nota: total_value é calculado automaticamente

### PUT `/budgets/:id`
Atualizar orçamento

### DELETE `/budgets/:id`
Deletar orçamento

---

## 📄 Documentos

### GET `/documents`
Listar todos os documentos
```
Retorna: Array com client_name, project_name, employee_name
```

### GET `/documents/:id`
Obter documento específico

### GET `/documents/:entityType/:entityId`
Listar documentos de uma entidade
```
entityType: client, project, employee
```

### POST `/documents/upload`
Fazer upload de arquivo
```
Content-Type: multipart/form-data

Campos:
- file: arquivo (obrigatório)
- category: contract, rg, cpf, nr, proof, budget, other (obrigatório)
- client_id: uuid (opcional)
- project_id: uuid (opcional)
- employee_id: uuid (opcional)
- observations: texto (opcional)
```

### GET `/documents/download/:id`
Fazer download de arquivo
```
Retorna: arquivo para download
```

### DELETE `/documents/:id`
Deletar documento (remove arquivo fisicamente)

---

## 👷 Colaboradores

### GET `/employees`
Listar colaboradores ativos

### GET `/employees/:id`
Obter colaborador específico
```
Retorna: { ..., documents }
```

### POST `/employees`
Criar colaborador
```json
{
  "name": "Carlos Silva",
  "cpf": "123.456.789-10",
  "phone": "(11) 99999-9999",
  "position": "Mestre de Obras",
  "admission_date": "2024-01-15",
  "observations": "..."
}
```

### PUT `/employees/:id`
Atualizar colaborador

### DELETE `/employees/:id`
Deletar colaborador (marca como inativo)

---

## 📑 Contratos

### GET `/contracts`
Listar todos os contratos
```
Retorna: Array com client_name, project_name
```

### GET `/contracts/:id`
Obter contrato específico

### POST `/contracts`
Criar contrato
```json
{
  "client_id": "uuid",
  "project_id": "uuid",
  "contract_number": "CT-001",
  "value": 50000,
  "start_date": "2024-01-15",
  "end_date": "2024-03-15",
  "observations": "..."
}
```

### PUT `/contracts/:id`
Atualizar contrato

### DELETE `/contracts/:id`
Deletar contrato

---

## 💰 Financeiro

### GET `/finance`
Listar todas as transações
```
Retorna: Array com project_name
```

### GET `/finance/:id`
Obter transação específica

### GET `/finance/report/monthly?month=1&year=2024`
Relatório mensal
```json
Retorna: {
  "month": 1,
  "year": 2024,
  "total_income": 100000,
  "total_expenses": 50000,
  "profit": 50000
}
```

### GET `/finance/report/project/:projectId`
Relatório de lucro/prejuízo por obra
```json
Retorna: {
  "project_id": "uuid",
  "total_income": 100000,
  "total_expenses": 50000,
  "profit": 50000,
  "profit_margin": "50.00"
}
```

### POST `/finance`
Criar lançamento financeiro (requer role: admin ou financial)
```json
{
  "type": "income",
  "description": "Pagamento Cliente ABC",
  "value": 25000,
  "date": "2024-01-15",
  "category": "payment",
  "project_id": "uuid",
  "payment_method": "PIX",
  "notes": "..."
}
```

Tipos: `income`, `expense`
Categorias: payment, advance, supplies, payroll, fuel, etc

### PUT `/finance/:id`
Atualizar transação (requer role: admin ou financial)

### DELETE `/finance/:id`
Deletar transação (requer role: admin ou financial)

---

## 🔐 Usuários

Requer: Authorization header + role: admin

### GET `/users`
Listar todos os usuários
```
Retorna: Array (sem senhas)
```

### GET `/users/:id`
Obter usuário específico

### POST `/users`
Criar usuário (admin only)
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "operational"
}
```

Roles disponíveis:
- `admin` - Gerenciar sistema inteiro
- `financial` - Gerenciar financeiro
- `operational` - Acesso operacional

### PUT `/users/:id`
Atualizar usuário (admin only)

### DELETE `/users/:id`
Deletar usuário (admin only)

---

## 🏥 Health Check

### GET `/health`
Verificar status da API
```json
Retorna: {
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ⚠️ Códigos de Erro

| Código | Significado |
|--------|------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado (token inválido/expirado) |
| 403 | Acesso negado (papel insuficiente) |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |

---

## 📝 Exemplo de Uso com JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@santorini.com',
    password: 'admin123'
  })
})

const { token } = await loginResponse.json()

// Listar clientes
const clientsResponse = await fetch('http://localhost:3000/api/clients', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const clients = await clientsResponse.json()
console.log(clients)

// Criar cliente
const createResponse = await fetch('http://localhost:3000/api/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Nova Empresa',
    email: 'empresa@example.com',
    phone: '(11) 99999-9999'
  })
})

const newClient = await createResponse.json()
console.log(newClient)
```

---

## 📚 Referência de Tipos

### Cliente
```json
{
  "id": "uuid",
  "name": "string",
  "cpf_cnpj": "string",
  "phone": "string",
  "email": "string",
  "address": "string",
  "address_number": "string",
  "address_complement": "string",
  "city": "string",
  "state": "string",
  "postal_code": "string",
  "observations": "string",
  "active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Obra
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "name": "string",
  "address": "string",
  "address_number": "string",
  "city": "string",
  "state": "string",
  "responsible": "string",
  "start_date": "date",
  "end_date_forecast": "date",
  "status": "planned|in_progress|paused|finished",
  "budget": "decimal",
  "cost": "decimal",
  "observations": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

Esta é a documentação completa de todos os endpoints da API Santorini ERP.
