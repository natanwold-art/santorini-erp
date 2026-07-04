import { getDatabase } from '../database/init.js';
import { generateId } from '../utils/helpers.js';

export async function getAllBudgets(req, res) {
  try {
    const db = getDatabase();
    const budgets = await db.all(`
      SELECT b.*, c.name as client_name 
      FROM budgets b
      LEFT JOIN clients c ON b.client_id = c.id
      ORDER BY b.created_at DESC
    `);
    
    res.json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getBudgetById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const budget = await db.get(`
      SELECT b.*, c.name as client_name 
      FROM budgets b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = ?
    `, [id]);
    
    if (!budget) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createBudget(req, res) {
  try {
    const { client_id, service_type, square_meters, value_per_meter, observations } = req.body;

    if (!client_id || !service_type || !square_meters || !value_per_meter) {
      return res.status(400).json({ error: 'Cliente, tipo de serviço, metragem e valor são obrigatórios' });
    }

    const db = getDatabase();
    const id = generateId();
    const total_value = square_meters * value_per_meter;

    await db.run(
      `INSERT INTO budgets (id, client_id, service_type, square_meters, value_per_meter, total_value, status, observations)
       VALUES (?, ?, ?, ?, ?, ?, 'analysis', ?)`,
      [id, client_id, service_type, square_meters, value_per_meter, total_value, observations]
    );

    const newBudget = await db.get(`
      SELECT b.*, c.name as client_name 
      FROM budgets b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = ?
    `, [id]);

    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateBudget(req, res) {
  try {
    const { id } = req.params;
    const { service_type, square_meters, value_per_meter, status, observations } = req.body;

    const db = getDatabase();
    const budget = await db.get('SELECT * FROM budgets WHERE id = ?', [id]);

    if (!budget) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    const newSquareMeters = square_meters || budget.square_meters;
    const newValuePerMeter = value_per_meter || budget.value_per_meter;
    const total_value = newSquareMeters * newValuePerMeter;

    await db.run(
      `UPDATE budgets SET service_type = ?, square_meters = ?, value_per_meter = ?, total_value = ?, status = ?, observations = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [service_type || budget.service_type, newSquareMeters, newValuePerMeter, total_value, status || budget.status, observations || budget.observations, id]
    );

    const updatedBudget = await db.get(`
      SELECT b.*, c.name as client_name 
      FROM budgets b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = ?
    `, [id]);

    res.json(updatedBudget);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteBudget(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.run('DELETE FROM budgets WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getBudgetsByStatus(req, res) {
  try {
    const { status } = req.query;

    const db = getDatabase();
    const budgets = await db.all(`
      SELECT b.*, c.name as client_name 
      FROM budgets b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.status = ?
      ORDER BY b.created_at DESC
    `, [status]);

    res.json(budgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: error.message });
  }
}
