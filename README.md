# Santorini ERP - Sistema de Gestão de Construções

Sistema ERP empresarial completo para gerenciar clientes, obras, orçamentos, documentos, colaboradores, contratos e financeiro.

## 📋 Tecnologias

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Autenticação**: JWT (JSON Web Tokens)
- **Banco de Dados**: SQLite (preparado para migração para PostgreSQL)

## 📦 Estrutura do Projeto

```
santorini-erp/
├── backend/          # Servidor Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── routes/         # Endpoints da API
│   │   ├── middleware/     # Autenticação, validação
│   │   ├── database/       # Configuração do banco
│   │   └── utils/          # Funções auxiliares
│   ├── uploads/            # Armazenamento de arquivos
│   └── package.json
├── frontend/         # Aplicação React
│   ├── src/
│   │   ├── pages/          # Páginas dos módulos
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── context/        # Context API (autenticação)
│   │   ├── services/       # Chamadas à API
│   │   └── utils/          # Funções auxiliares
│   └── package.json
└── README.md
```

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v16+)
- npm ou yarn

### 1️⃣ Setup do Backend

```bash
# Entrar no diretório backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (já vem com padrão)
# Arquivo: backend/.env está configurado

# Rodar o servidor em modo desenvolvimento
npm run dev
```

O backend estará rodando em: **http://localhost:3000**

### 2️⃣ Setup do Frontend

Em outro terminal:

```bash
# Entrar no diretório frontend
cd frontend

# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

### 3️⃣ Acessar o Sistema

1. Abra o navegador em: **http://localhost:5173**
2. Faça login ou registre uma nova conta
3. Explore o sistema!

## 👤 Usuário Padrão

Após a primeira inicialização, você pode registrar um novo usuário na tela de login.

**Roles disponíveis:**
- `admin` - Acesso total (gerenciar usuários)
- `financial` - Acesso ao módulo financeiro
- `operational` - Acesso aos módulos operacionais

## 📚 Módulos do Sistema

1. **Dashboard** - Visão geral com indicadores e gráficos
2. **Clientes** - Cadastro e gestão de clientes (CPF/CNPJ)
3. **Obras** - Gestão de projetos/obras com status
4. **Orçamentos** - Cálculo automático e status de orçamentos
5. **Documentos** - Upload e organização de arquivos
6. **Colaboradores** - Gestão de equipe
7. **Contratos** - Registro de contratos
8. **Financeiro** - Entradas, saídas e relatórios
9. **Usuários** - Gerenciamento de usuários (admin only)

## 🔒 Segurança

- Senhas criptografadas com bcryptjs
- Autenticação por JWT
- Controle de acesso por papel (role-based)
- Validação de CPF/CNPJ
- Proteção contra SQL injection

## 💾 Banco de Dados

O banco de dados SQLite é criado automaticamente na primeira execução.

**Arquivo:** `santorini.db` (na raiz do backend)

### Backup Manual

```bash
# Fazer backup do banco de dados
cp backend/santorini.db backend/santorini_backup.db
```

## 🛠️ Desenvolvimento

### Adicionar Nova Página/Módulo

1. Criar arquivo em `frontend/src/pages/NomeModulo.jsx`
2. Criar controller em `backend/src/controllers/nomeController.js`
3. Criar rotas em `backend/src/routes/nome.js`
4. Adicionar rota ao `backend/src/index.js`
5. Importar página no `frontend/src/App.jsx`

### Variáveis de Ambiente

**Backend (.env):**
```
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta
DATABASE_PATH=./santorini.db
UPLOAD_PATH=./uploads
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000/api
```

## 🐛 Troubleshooting

### Porta 3000 já em uso
```bash
# Windows - Liberar porta
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux - Liberar porta
lsof -i :3000
kill -9 <PID>
```

### Erro de banco de dados
```bash
# Deletar banco de dados e recrear
rm backend/santorini.db
npm run dev
```

### CORS error
- Verifique se backend está rodando em `http://localhost:3000`
- Verifique configuração de proxy no `vite.config.js`

## 📊 Build para Produção

### Frontend
```bash
cd frontend
npm run build
# Gera arquivo em: frontend/dist/
```

### Deploy
O frontend pode ser hospedado em:
- Vercel
- Netlify
- GitHub Pages
- Amazon S3

O backend pode ser hospedado em:
- Heroku
- Railway
- Render
- AWS EC2

## 📝 Notas

- Sistema preparado para migração futura para PostgreSQL
- Suporta geração de PDF (integração futura)
- Pronto para app mobile (com configurações adequadas)
- Integração fiscal preparada para implementação

## 👨‍💻 Próximos Passos

- [ ] Implementar geração de PDF para contratos
- [ ] Criar app mobile com React Native
- [ ] Integração com sistema fiscal
- [ ] Migrar para PostgreSQL
- [ ] Implementar WebSocket para atualizações em tempo real
- [ ] Adicionar mais gráficos ao dashboard
- [ ] Exportar dados para Excel
- [ ] Sistema de notificações
- [ ] Integração com WhatsApp/Email

## 📄 Licença

Este projeto é privado da Santorini Construções.

## 👥 Suporte

Para dúvidas e sugestões, entre em contato com o time de desenvolvimento.

---

**Santorini Construções © 2024**
