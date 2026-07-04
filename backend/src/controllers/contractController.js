import { getDatabase } from '../database/init.js';
import { generateId } from '../utils/helpers.js';

export async function getAllContracts(req, res) {
  try {
    const db = getDatabase();
    const contracts = await db.all(`
      SELECT con.*, c.name as client_name, p.name as project_name
      FROM contracts con
      LEFT JOIN clients c ON con.client_id = c.id
      LEFT JOIN projects p ON con.project_id = p.id
      ORDER BY con.created_at DESC
    `);
    
    res.json(contracts);
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getContractById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const contract = await db.get(`
      SELECT con.*, c.name as client_name, p.name as project_name
      FROM contracts con
      LEFT JOIN clients c ON con.client_id = c.id
      LEFT JOIN projects p ON con.project_id = p.id
      WHERE con.id = ?
    `, [id]);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createContract(req, res) {
  try {
    const { client_id, project_id, contract_number, value, start_date, end_date, observations } = req.body;

    if (!client_id || !value || !start_date) {
      return res.status(400).json({ error: 'Cliente, valor e data de início são obrigatórios' });
    }

    const db = getDatabase();
    const id = generateId();

    await db.run(
      `INSERT INTO contracts (id, client_id, project_id, contract_number, value, start_date, end_date, status, observations)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [id, client_id, project_id || null, contract_number, value, start_date, end_date, observations]
    );

    const newContract = await db.get(`
      SELECT con.*, c.name as client_name, p.name as project_name
      FROM contracts con
      LEFT JOIN clients c ON con.client_id = c.id
      LEFT JOIN projects p ON con.project_id = p.id
      WHERE con.id = ?
    `, [id]);

    res.status(201).json(newContract);
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateContract(req, res) {
  try {
    const { id } = req.params;
    const { contract_number, value, start_date, end_date, status, observations } = req.body;

    const db = getDatabase();
    const contract = await db.get('SELECT * FROM contracts WHERE id = ?', [id]);

    if (!contract) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }

    await db.run(
      `UPDATE contracts SET contract_number = ?, value = ?, start_date = ?, end_date = ?, status = ?, observations = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [contract_number || contract.contract_number, value || contract.value, start_date || contract.start_date, end_date || contract.end_date, status || contract.status, observations || contract.observations, id]
    );

    const updatedContract = await db.get(`
      SELECT con.*, c.name as client_name, p.name as project_name
      FROM contracts con
      LEFT JOIN clients c ON con.client_id = c.id
      LEFT JOIN projects p ON con.project_id = p.id
      WHERE con.id = ?
    `, [id]);

    res.json(updatedContract);
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteContract(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.run('DELETE FROM contracts WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }

    res.json({ message: 'Contrato deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar contrato:', error);
    res.status(500).json({ error: error.message });
  }
}
