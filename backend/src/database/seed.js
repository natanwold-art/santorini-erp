import { getDatabase, initializeDatabase } from './init.js'
import { generateId, hashPassword } from '../utils/helpers.js'

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...')
    
    await initializeDatabase()
    const db = getDatabase()

    // Limpar dados existentes
    await db.exec(`
      DELETE FROM finance_entries;
      DELETE FROM documents;
      DELETE FROM contracts;
      DELETE FROM budgets;
      DELETE FROM projects;
      DELETE FROM employees;
      DELETE FROM clients;
      DELETE FROM users;
    `)

    // Criar usuários de exemplo
    console.log('📝 Criando usuários...')
    const adminPassword = await hashPassword('admin123')
    const userPassword = await hashPassword('user123')

    const adminId = generateId()
    const userId = generateId()
    const operationalId = generateId()

    await db.run(
      'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [adminId, 'Administrador', 'admin@santorini.com', adminPassword, 'admin']
    )

    await db.run(
      'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [userId, 'Financeiro', 'financeiro@santorini.com', userPassword, 'financial']
    )

    await db.run(
      'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [operationalId, 'Operacional', 'operacional@santorini.com', userPassword, 'operational']
    )

    // Criar clientes de exemplo
    console.log('👥 Criando clientes...')
    const clients = [
      {
        id: generateId(),
        name: 'Empresa ABC Ltda',
        cpf_cnpj: '12.345.678/0001-90',
        phone: '(11) 99999-9999',
        email: 'contato@empresaabc.com',
        address: 'Rua das Flores',
        address_number: '100',
        city: 'São Paulo',
        state: 'SP',
      },
      {
        id: generateId(),
        name: 'João Silva',
        cpf_cnpj: '123.456.789-10',
        phone: '(11) 98888-8888',
        email: 'joao@email.com',
        address: 'Av. Paulista',
        address_number: '1000',
        city: 'São Paulo',
        state: 'SP',
      },
      {
        id: generateId(),
        name: 'Maria Santos',
        cpf_cnpj: '987.654.321-00',
        phone: '(11) 97777-7777',
        email: 'maria@email.com',
        address: 'Rua Augusta',
        address_number: '500',
        city: 'São Paulo',
        state: 'SP',
      },
    ]

    for (const client of clients) {
      await db.run(
        'INSERT INTO clients (id, name, cpf_cnpj, phone, email, address, address_number, city, state, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
        [client.id, client.name, client.cpf_cnpj, client.phone, client.email, client.address, client.address_number, client.city, client.state]
      )
    }

    // Criar obras de exemplo
    console.log('🏗️ Criando obras...')
    const projects = [
      {
        id: generateId(),
        client_id: clients[0].id,
        name: 'Reforma Comercial - Sala',
        address: 'Rua das Flores',
        address_number: '100',
        city: 'São Paulo',
        responsible: 'Carlos Silva',
        start_date: '2024-01-15',
        end_date_forecast: '2024-03-15',
        status: 'in_progress',
        budget: 50000,
      },
      {
        id: generateId(),
        client_id: clients[1].id,
        name: 'Construção Casa Residencial',
        address: 'Av. Paulista',
        address_number: '1000',
        city: 'São Paulo',
        responsible: 'Pedro Costa',
        start_date: '2024-02-01',
        end_date_forecast: '2024-06-01',
        status: 'in_progress',
        budget: 120000,
      },
      {
        id: generateId(),
        client_id: clients[2].id,
        name: 'Acabamento Apartamento',
        address: 'Rua Augusta',
        address_number: '500',
        city: 'São Paulo',
        responsible: 'João Santos',
        start_date: '2024-03-01',
        end_date_forecast: '2024-04-01',
        status: 'planned',
        budget: 30000,
      },
    ]

    for (const project of projects) {
      await db.run(
        'INSERT INTO projects (id, client_id, name, address, address_number, city, responsible, start_date, end_date_forecast, status, budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [project.id, project.client_id, project.name, project.address, project.address_number, project.city, project.responsible, project.start_date, project.end_date_forecast, project.status, project.budget]
      )
    }

    // Criar orçamentos de exemplo
    console.log('📋 Criando orçamentos...')
    const budgets = [
      {
        id: generateId(),
        client_id: clients[0].id,
        service_type: 'Pintura',
        square_meters: 150,
        value_per_meter: 50,
        status: 'approved',
      },
      {
        id: generateId(),
        client_id: clients[1].id,
        service_type: 'Alvenaria',
        square_meters: 300,
        value_per_meter: 300,
        status: 'analysis',
      },
    ]

    for (const budget of budgets) {
      const total = budget.square_meters * budget.value_per_meter
      await db.run(
        'INSERT INTO budgets (id, client_id, service_type, square_meters, value_per_meter, total_value, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [budget.id, budget.client_id, budget.service_type, budget.square_meters, budget.value_per_meter, total, budget.status]
      )
    }

    // Criar colaboradores de exemplo
    console.log('👷 Criando colaboradores...')
    const employees = [
      {
        id: generateId(),
        name: 'Carlos Silva',
        cpf: '123.456.789-10',
        phone: '(11) 99999-1111',
        position: 'Mestre de Obras',
        admission_date: '2023-01-15',
        status: 'active',
      },
      {
        id: generateId(),
        name: 'Pedro Costa',
        cpf: '987.654.321-01',
        phone: '(11) 99999-2222',
        position: 'Encanador',
        admission_date: '2023-03-01',
        status: 'active',
      },
      {
        id: generateId(),
        name: 'João Santos',
        cpf: '456.789.123-45',
        phone: '(11) 99999-3333',
        position: 'Eletricista',
        admission_date: '2023-06-01',
        status: 'active',
      },
    ]

    for (const emp of employees) {
      await db.run(
        'INSERT INTO employees (id, name, cpf, phone, position, admission_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [emp.id, emp.name, emp.cpf, emp.phone, emp.position, emp.admission_date, emp.status]
      )
    }

    // Criar contratos de exemplo
    console.log('📑 Criando contratos...')
    const contracts = [
      {
        id: generateId(),
        client_id: clients[0].id,
        project_id: projects[0].id,
        contract_number: 'CT-001',
        value: 50000,
        start_date: '2024-01-15',
        end_date: '2024-03-15',
        status: 'active',
      },
      {
        id: generateId(),
        client_id: clients[1].id,
        project_id: projects[1].id,
        contract_number: 'CT-002',
        value: 120000,
        start_date: '2024-02-01',
        end_date: '2024-06-01',
        status: 'active',
      },
    ]

    for (const contract of contracts) {
      await db.run(
        'INSERT INTO contracts (id, client_id, project_id, contract_number, value, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [contract.id, contract.client_id, contract.project_id, contract.contract_number, contract.value, contract.start_date, contract.end_date, contract.status]
      )
    }

    // Criar entradas/saídas financeiras de exemplo
    console.log('💰 Criando registros financeiros...')
    const currentDate = new Date().toISOString().slice(0, 10)
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)

    const financeEntries = [
      { id: generateId(), type: 'income', description: 'Pagamento Projeto ABC', value: 25000, date: currentDate, category: 'payment', project_id: projects[0].id },
      { id: generateId(), type: 'income', description: 'Adiantamento Projeto Residencial', value: 60000, date: currentDate, category: 'advance', project_id: projects[1].id },
      { id: generateId(), type: 'expense', description: 'Material de Construção', value: 15000, date: currentDate, category: 'supplies', project_id: projects[0].id },
      { id: generateId(), type: 'expense', description: 'Folha de Pagamento', value: 12000, date: currentDate, category: 'payroll', project_id: null },
      { id: generateId(), type: 'income', description: 'Pagamento Anterior', value: 35000, date: `${lastMonth}-15`, category: 'payment', project_id: projects[0].id },
      { id: generateId(), type: 'expense', description: 'Combustível', value: 2000, date: `${lastMonth}-10`, category: 'fuel', project_id: projects[1].id },
    ]

    for (const entry of financeEntries) {
      await db.run(
        'INSERT INTO finance_entries (id, type, description, value, date, category, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [entry.id, entry.type, entry.description, entry.value, entry.date, entry.category, entry.project_id]
      )
    }

    console.log('✅ Banco de dados populado com sucesso!')
    console.log('\n📍 Dados de teste criados:')
    console.log('   • 3 usuários (admin, financial, operational)')
    console.log('   • 3 clientes')
    console.log('   • 3 obras')
    console.log('   • 2 orçamentos')
    console.log('   • 3 colaboradores')
    console.log('   • 2 contratos')
    console.log('   • 6 registros financeiros')
    console.log('\n🔐 Credenciais de teste:')
    console.log('   Admin: admin@santorini.com / admin123')
    console.log('   Financial: financeiro@santorini.com / user123')
    console.log('   Operational: operacional@santorini.com / user123')
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error)
  }
}

// Executar seed
seedDatabase().then(() => process.exit(0))
