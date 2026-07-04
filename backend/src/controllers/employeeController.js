import { getDatabase } from '../database/init.js';
import { generateId, formatCPF } from '../utils/helpers.js';

export async function getAllEmployees(req, res) {
  try {
    const db = getDatabase();
    const employees = await db.all('SELECT * FROM employees WHERE active = TRUE ORDER BY name');
    
    res.json(employees);
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const employee = await db.get('SELECT * FROM employees WHERE id = ? AND active = TRUE', [id]);
    
    if (!employee) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    const documents = await db.all('SELECT * FROM documents WHERE employee_id = ?', [id]);

    res.json({ ...employee, documents });
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createEmployee(req, res) {
  try {
    const { name, cpf, phone, position, admission_date, observations } = req.body;

    if (!name || !position) {
      return res.status(400).json({ error: 'Nome e cargo são obrigatórios' });
    }

    const db = getDatabase();
    const id = generateId();
    const formattedCpf = cpf ? formatCPF(cpf) : null;

    await db.run(
      `INSERT INTO employees (id, name, cpf, phone, position, admission_date, status, observations)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      [id, name, formattedCpf, phone, position, admission_date, observations]
    );

    const newEmployee = await db.get('SELECT * FROM employees WHERE id = ?', [id]);

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Erro ao criar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { name, cpf, phone, position, admission_date, status, observations } = req.body;

    const db = getDatabase();
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [id]);

    if (!employee) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    const formattedCpf = cpf ? formatCPF(cpf) : employee.cpf;

    await db.run(
      `UPDATE employees SET name = ?, cpf = ?, phone = ?, position = ?, admission_date = ?, status = ?, observations = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || employee.name, formattedCpf, phone || employee.phone, position || employee.position, admission_date || employee.admission_date, status || employee.status, observations || employee.observations, id]
    );

    const updatedEmployee = await db.get('SELECT * FROM employees WHERE id = ?', [id]);

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const employee = await db.get('SELECT * FROM employees WHERE id = ?', [id]);

    if (!employee) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    await db.run('UPDATE employees SET active = FALSE, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['inactive', id]);

    res.json({ message: 'Colaborador deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error);
    res.status(500).json({ error: error.message });
  }
}
