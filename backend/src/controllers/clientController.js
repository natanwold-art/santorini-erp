import { getDatabase } from '../database/init.js';
import { generateId, formatCPF, formatCNPJ, validateCPF, validateCNPJ } from '../utils/helpers.js';

export async function getAllClients(req, res) {
  try {
    const db = getDatabase();
    const clients = await db.all('SELECT * FROM clients WHERE active = TRUE ORDER BY name');
    
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getClientById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const client = await db.get('SELECT * FROM clients WHERE id = ? AND active = TRUE', [id]);
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Buscar documentos do cliente
    const documents = await db.all('SELECT * FROM documents WHERE client_id = ?', [id]);
    
    // Buscar projetos do cliente
    const projects = await db.all('SELECT * FROM projects WHERE client_id = ?', [id]);

    res.json({ ...client, documents, projects });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createClient(req, res) {
  try {
    const { name, cpf_cnpj, phone, email, address, address_number, address_complement, city, state, postal_code, observations } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do cliente é obrigatório' });
    }

    // Validar CPF ou CNPJ se fornecido
    if (cpf_cnpj) {
      const isCPF = cpf_cnpj.replace(/\D/g, '').length === 11;
      const isCNPJ = cpf_cnpj.replace(/\D/g, '').length === 14;

      if (isCPF && !validateCPF(cpf_cnpj)) {
        return res.status(400).json({ error: 'CPF inválido' });
      }

      if (isCNPJ && !validateCNPJ(cpf_cnpj)) {
        return res.status(400).json({ error: 'CNPJ inválido' });
      }
    }

    const db = getDatabase();
    const id = generateId();

    const formattedCpfCnpj = cpf_cnpj 
      ? (cpf_cnpj.replace(/\D/g, '').length === 11 ? formatCPF(cpf_cnpj) : formatCNPJ(cpf_cnpj))
      : null;

    await db.run(
      `INSERT INTO clients (id, name, cpf_cnpj, phone, email, address, address_number, address_complement, city, state, postal_code, observations, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, name, formattedCpfCnpj, phone, email, address, address_number, address_complement, city, state, postal_code, observations]
    );

    const newClient = await db.get('SELECT * FROM clients WHERE id = ?', [id]);

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const { name, cpf_cnpj, phone, email, address, address_number, address_complement, city, state, postal_code, observations } = req.body;

    const db = getDatabase();
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [id]);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const formattedCpfCnpj = cpf_cnpj 
      ? (cpf_cnpj.replace(/\D/g, '').length === 11 ? formatCPF(cpf_cnpj) : formatCNPJ(cpf_cnpj))
      : client.cpf_cnpj;

    await db.run(
      `UPDATE clients SET name = ?, cpf_cnpj = ?, phone = ?, email = ?, address = ?, address_number = ?, address_complement = ?, city = ?, state = ?, postal_code = ?, observations = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || client.name, formattedCpfCnpj, phone || client.phone, email || client.email, address || client.address, address_number || client.address_number, address_complement || client.address_complement, city || client.city, state || client.state, postal_code || client.postal_code, observations || client.observations, id]
    );

    const updatedClient = await db.get('SELECT * FROM clients WHERE id = ?', [id]);

    res.json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const client = await db.get('SELECT * FROM clients WHERE id = ?', [id]);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await db.run('UPDATE clients SET active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function searchClients(req, res) {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Digite pelo menos 2 caracteres' });
    }

    const db = getDatabase();
    const searchTerm = `%${query}%`;

    const clients = await db.all(
      `SELECT * FROM clients WHERE active = TRUE AND (name LIKE ? OR email LIKE ? OR cpf_cnpj LIKE ? OR phone LIKE ?)
       ORDER BY name LIMIT 20`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: error.message });
  }
}
