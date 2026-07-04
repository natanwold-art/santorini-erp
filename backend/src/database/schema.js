export async function createSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'financial', 'operational')),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpf_cnpj TEXT UNIQUE,
      phone TEXT,
      email TEXT,
      address TEXT,
      address_number TEXT,
      address_complement TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      observations TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      address_number TEXT,
      address_complement TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      responsible TEXT,
      start_date DATE,
      end_date_forecast DATE,
      status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'in_progress', 'paused', 'finished')),
      budget DECIMAL(12, 2),
      cost DECIMAL(12, 2),
      observations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      service_type TEXT NOT NULL,
      square_meters DECIMAL(10, 2),
      value_per_meter DECIMAL(10, 2),
      total_value DECIMAL(12, 2),
      status TEXT NOT NULL DEFAULT 'analysis' CHECK(status IN ('analysis', 'approved', 'rejected')),
      budget_date DATE DEFAULT CURRENT_DATE,
      observations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      category TEXT NOT NULL CHECK(category IN ('contract', 'rg', 'cpf', 'nr', 'proof', 'budget', 'other')),
      client_id TEXT,
      project_id TEXT,
      employee_id TEXT,
      observations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpf TEXT UNIQUE,
      phone TEXT,
      position TEXT NOT NULL,
      admission_date DATE,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      active BOOLEAN DEFAULT TRUE,
      observations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      project_id TEXT,
      contract_number TEXT UNIQUE,
      value DECIMAL(12, 2) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'finished', 'cancelled')),
      observations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS finance_entries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      description TEXT NOT NULL,
      value DECIMAL(12, 2) NOT NULL,
      date DATE DEFAULT CURRENT_DATE,
      category TEXT NOT NULL,
      project_id TEXT,
      payment_method TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  await ensureSchemaMigrations(db);

  console.log('Todas as tabelas criadas');
}

async function ensureSchemaMigrations(db) {
  await runOptionalMigration(
    db,
    'ALTER TABLE employees ADD COLUMN active BOOLEAN DEFAULT TRUE'
  );
}

async function runOptionalMigration(db, sql) {
  try {
    await db.exec(sql);
  } catch (error) {
    const message = String(error?.message || error).toLowerCase();
    if (message.includes('duplicate column') || message.includes('already exists')) {
      return;
    }
    throw error;
  }
}
