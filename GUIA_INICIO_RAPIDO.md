# 🚀 Guia de Início Rápido - Santorini ERP

## 📌 Resumo do Projeto

Sistema ERP completo e profissional para gerenciar:
- ✅ Clientes (CPF/CNPJ)
- ✅ Obras/Projetos
- ✅ Orçamentos
- ✅ Documentos
- ✅ Colaboradores
- ✅ Contratos
- ✅ Financeiro (Entradas e Saídas)
- ✅ Usuários com controle de acesso

## 🎯 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Banco** | SQLite (migração para PostgreSQL preparada) |
| **Auth** | JWT + bcryptjs |

## ⚡ Instalação Rápida (5 minutos)

### Passo 1: Instalar Dependências do Backend

```bash
# Abra o terminal e navegue até a pasta do projeto
cd c:\santorini-erp

# Vá para a pasta backend
cd backend

# Instale as dependências
npm install

# ✅ Pronto! Backend instalado
```

### Passo 2: Instalar Dependências do Frontend

```bash
# Abra um NOVO terminal na mesma pasta do projeto
cd c:\santorini-erp\frontend

# Instale as dependências
npm install

# ✅ Pronto! Frontend instalado
```

## 🏃 Executando o Projeto

### Terminal 1 - Backend

```bash
# A partir de: c:\santorini-erp\backend

# Opção 1: Rodar servidor normalmente
npm start

# Opção 2: Rodar com auto-reload (desenvolvimento - RECOMENDADO)
npm run dev

# Você verá: 🚀 Servidor rodando em http://localhost:3000
```

### Terminal 2 - Frontend

```bash
# A partir de: c:\santorini-erp\frontend

# Rodar aplicação em desenvolvimento
npm run dev

# Você verá: ✓ Local: http://localhost:5173/
# Pressione 'o' para abrir no navegador
```

## 🔐 Primeiro Acesso

### Opção 1: Criar Nova Conta

1. Acesse: **http://localhost:5173**
2. Clique em **"Registre-se"**
3. Preencha: Nome, Email e Senha
4. Pronto! Você está dentro do sistema 🎉

### Opção 2: Usar Dados de Teste

Popularo banco com dados de exemplo:

```bash
# No terminal do backend, execute:
npm run seed

# Você verá: ✅ Banco de dados populado com sucesso!
```

**Credenciais de teste:**

| Perfil | Email | Senha |
|--------|-------|-------|
| Administrador | admin@santorini.com | admin123 |
| Financeiro | financeiro@santorini.com | user123 |
| Operacional | operacional@santorini.com | user123 |

## 📚 Testando os Módulos

### Dashboard (Início)
- Vê resumo de indicadores
- Mostra entradas/saídas do mês
- Acesso rápido aos módulos

### Clientes 👥
1. Clique em **"Clientes"** no menu
2. Clique em **"➕ Novo Cliente"**
3. Preencha os dados:
   - Nome
   - CPF/CNPJ (com validação)
   - Email, Telefone
   - Endereço, Cidade, Estado
4. Clique em **"✅ Criar"**
5. Veja o cliente na listagem
6. Use **"Editar"** ou **"Deletar"** conforme necessário

### Obras 🏗️
1. Clique em **"Obras"** no menu
2. Clique em **"➕ Nova Obra"**
3. Selecione um cliente
4. Preencha dados da obra
5. Defina o status (Planejada, Em Andamento, etc)
6. Clique em **"✅ Salvar"**

### Orçamentos 📋
- Cadastre orçamentos com cálculo automático
- Status: Em análise, Aprovado, Recusado
- Filtrar por status

### Documentos 📄
- Faça upload de arquivos
- Categorize: Contrato, RG, CPF, NR, Comprovante, etc
- Organize por cliente ou obra

### Colaboradores 👷
- Cadastre equipe com CPF
- Defina cargo e data de admissão
- Marque como Ativo/Inativo

### Contratos 📑
- Registre contratos com clientes
- Vincule a obras
- Acompanhe status

### Financeiro 💰
- Registre entradas e saídas
- Defina categoria
- Veja relatórios de lucro/prejuízo

### Usuários 🔐 (Apenas Admin)
- Crie novos usuários
- Atribua papéis (Admin, Financeiro, Operacional)
- Gerencie acesso ao sistema

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"

**Windows:**
```bash
# Abra o Power Shell como admin e execute:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id <PID> -Force
```

**macOS/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

### Erro: "Cannot connect to database"

```bash
# Delete o banco e recrie:
rm backend/santorini.db

# Reinicie o backend:
npm run dev
```

### Frontend não conecta ao Backend

Verifique:
1. Backend está rodando? (http://localhost:3000)
2. Arquivo `frontend/.env` está correto?
3. Desligue firewall temporariamente

### Erro de CORS

Reinicie ambos servidores:
1. Mateo Backend (Ctrl+C)
2. Mate Frontend (Ctrl+C)
3. Inicie Backend primeiro
4. Depois Frontend

## 📦 Estrutura de Pastas

```
santorini-erp/
│
├── backend/
│   ├── src/
│   │   ├── index.js          # Servidor principal
│   │   ├── controllers/      # Lógica de cada módulo
│   │   ├── routes/           # Endpoints da API
│   │   ├── middleware/       # Autenticação JWT
│   │   ├── database/         # SQLite config
│   │   └── utils/            # Funções auxiliares
│   │
│   ├── uploads/              # Armazenamento de arquivos
│   ├── .env                  # Variáveis de ambiente
│   ├── package.json
│   └── santorini.db          # Banco de dados (criado automaticamente)
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Páginas (Dashboard, Clientes, etc)
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── context/          # Autenticação (Context API)
│   │   ├── services/         # Chamadas à API
│   │   ├── App.jsx           # Roteamento principal
│   │   └── main.jsx          # Entry point React
│   │
│   ├── public/               # Arquivos estáticos
│   ├── index.html
│   ├── vite.config.js        # Configuração Vite
│   ├── tailwind.config.js    # Tailwind CSS
│   ├── .env                  # Variáveis de ambiente
│   └── package.json
│
├── README.md                 # Documentação completa
└── GUIA_INICIO_RAPIDO.md     # Este arquivo
```

## 🛠️ Comandos Úteis

### Backend

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start

# Popular banco com dados de teste
npm run seed
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🎨 Interface

### Cores do Sistema
- **Azul Escuro (#1e3a8a)**: Cor primária
- **Cinza (#64748b)**: Cor secundária
- **Dourado (#d4af37)**: Destaque/Acentos
- **Branco**: Fundo

### Layout
- Menu lateral fixo (pode ser recolhido)
- Navbar superior com usuário e logout
- Dashboard responsivo para mobile
- Cards bonitos com ícones
- Tabelas bem organizadas
- Modais para cadastros

## 🔐 Segurança

✅ **Implementado:**
- Senhas criptografadas (bcryptjs)
- Autenticação JWT
- Validação de CPF/CNPJ
- Proteção contra XSS
- CORS configurado
- Controle de acesso por papel

## 📊 Dados de Exemplo (Seed)

Ao executar `npm run seed`, o sistema cria:
- 3 usuários (admin, financeiro, operacional)
- 3 clientes com dados completos
- 3 obras em diferentes status
- 2 orçamentos
- 3 colaboradores
- 2 contratos
- 6 transações financeiras

## 🚀 Próximos Passos

Depois de testar o sistema, você pode:

1. **Personalizar cores** em `frontend/tailwind.config.js`
2. **Adicionar mais módulos** duplicando a estrutura de um módulo
3. **Integrar com serviços externos** (WhatsApp, Email, etc)
4. **Fazer build para produção** com `npm run build`
5. **Deployr para produção** em Vercel, Netlify ou um VPS

## 📞 Problemas?

Se encontrar problemas:

1. Verifique se Node.js está instalado:
   ```bash
   node --version
   npm --version
   ```

2. Limpe o cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Verifique as portas:
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173

## 📝 Notas Importantes

- Sistema preparado para migração futura para PostgreSQL
- Suporta upload de documentos (até 50MB)
- Validações de CPF/CNPJ funcionam corretamente
- Sistema de papéis controla acesso aos módulos
- Backup manual do banco em `backend/santorini_backup.db`

## ✅ Checklist Inicial

- [ ] Node.js instalado
- [ ] Backend instalado (`npm install`)
- [ ] Frontend instalado (`npm install`)
- [ ] Backend rodando (`npm run dev`)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Acessou http://localhost:5173
- [ ] Registrou nova conta ou usou seed
- [ ] Testou criar um cliente
- [ ] Testou criar uma obra
- [ ] Testou os outros módulos

---

**🎉 Parabéns! Seu sistema ERP está pronto!**

Para mais informações, veja **README.md**
