import { getDatabase } from '../database/init.js';
import { generateId } from '../utils/helpers.js';

export async function getAllFinanceEntries(req, res) {
  try {
    const db = getDatabase();
    const entries = await db.all(`
      SELECT fe.*, p.name as project_name
      FROM finance_entries fe
      LEFT JOIN projects p ON fe.project_id = p.id
      ORDER BY fe.date DESC
    `);
    
    res.json(entries);
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getFinanceEntryById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const entry = await db.get(`
      SELECT fe.*, p.name as project_name
      FROM finance_entries fe
      LEFT JOIN projects p ON fe.project_id = p.id
      WHERE fe.id = ?
    `, [id]);
    
    if (!entry) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Erro ao buscar lançamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createFinanceEntry(req, res) {
  try {
    const { type, description, value, date, category, project_id, payment_method, notes } = req.body;

    if (!type || !description || !value || !date || !category) {
      return res.status(400).json({ error: 'Tipo, descrição, valor, data e categoria são obrigatórios' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense"' });
    }

    const db = getDatabase();
    const id = generateId();

    await db.run(
      `INSERT INTO finance_entries (id, type, description, value, date, category, project_id, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type, description, value, date, category, project_id || null, payment_method, notes]
    );

    const newEntry = await db.get(`
      SELECT fe.*, p.name as project_name
      FROM finance_entries fe
      LEFT JOIN projects p ON fe.project_id = p.id
      WHERE fe.id = ?
    `, [id]);

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Erro ao criar lançamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateFinanceEntry(req, res) {
  try {
    const { id } = req.params;
    const { type, description, value, date, category, project_id, payment_method, notes } = req.body;

    const db = getDatabase();
    const entry = await db.get('SELECT * FROM finance_entries WHERE id = ?', [id]);

    if (!entry) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }

    await db.run(
      `UPDATE finance_entries SET type = ?, description = ?, value = ?, date = ?, category = ?, project_id = ?, payment_method = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [type || entry.type, description || entry.description, value || entry.value, date || entry.date, category || entry.category, project_id || entry.project_id, payment_method || entry.payment_method, notes || entry.notes, id]
    );

    const updatedEntry = await db.get(`
      SELECT fe.*, p.name as project_name
      FROM finance_entries fe
      LEFT JOIN projects p ON fe.project_id = p.id
      WHERE fe.id = ?
    `, [id]);

    res.json(updatedEntry);
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteFinanceEntry(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.run('DELETE FROM finance_entries WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lançamento não encontrado' });
    }

    res.json({ message: 'Lançamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lançamento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getProjectFinanceReport(req, res) {
  try {
    const { projectId } = req.params;

    const db = getDatabase();
    const income = await db.get(
      'SELECT COALESCE(SUM(value), 0) as total FROM finance_entries WHERE type = ? AND project_id = ?',
      ['income', projectId]
    );

    const expenses = await db.get(
      'SELECT COALESCE(SUM(value), 0) as total FROM finance_entries WHERE type = ? AND project_id = ?',
      ['expense', projectId]
    );

    const profit = income.total - expenses.total;

    res.json({
      project_id: projectId,
      total_income: income.total,
      total_expenses: expenses.total,
      profit: profit,
      profit_margin: income.total > 0 ? ((profit / income.total) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getMonthlyReport(req, res) {
  try {
    const { month, year } = req.query;

    const db = getDatabase();
    const income = await db.get(
      `SELECT COALESCE(SUM(value), 0) as total FROM finance_entries 
       WHERE type = ? AND strftime('%Y-%m', date) = ?`,
      ['income', `${year}-${String(month).padStart(2, '0')}`]
    );

    const expenses = await db.get(
      `SELECT COALESCE(SUM(value), 0) as total FROM finance_entries 
       WHERE type = ? AND strftime('%Y-%m', date) = ?`,
      ['expense', `${year}-${String(month).padStart(2, '0')}`]
    );

    res.json({
      month: parseInt(month),
      year: parseInt(year),
      total_income: income.total,
      total_expenses: expenses.total,
      profit: income.total - expenses.total
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: error.message });
  }
}
