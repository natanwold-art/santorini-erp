import { getDatabase } from '../database/init.js';
import { generateId } from '../utils/helpers.js';

export async function getAllProjects(req, res) {
  try {
    const db = getDatabase();
    const projects = await db.all(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);
    
    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar obras:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const project = await db.get(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (!project) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    // Buscar documentos da obra
    const documents = await db.all('SELECT * FROM documents WHERE project_id = ?', [id]);
    
    // Buscar financeiro da obra
    const finance = await db.all('SELECT * FROM finance_entries WHERE project_id = ? ORDER BY date DESC', [id]);

    res.json({ ...project, documents, finance });
  } catch (error) {
    console.error('Erro ao buscar obra:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createProject(req, res) {
  try {
    const { client_id, name, address, address_number, address_complement, city, state, postal_code, responsible, start_date, end_date_forecast, budget, observations } = req.body;

    if (!client_id || !name || !address) {
      return res.status(400).json({ error: 'Cliente, nome e endereço são obrigatórios' });
    }

    const db = getDatabase();
    const id = generateId();

    await db.run(
      `INSERT INTO projects (id, client_id, name, address, address_number, address_complement, city, state, postal_code, responsible, start_date, end_date_forecast, budget, status, observations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?)`,
      [id, client_id, name, address, address_number, address_complement, city, state, postal_code, responsible, start_date, end_date_forecast, budget, observations]
    );

    const newProject = await db.get(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erro ao criar obra:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { name, address, address_number, address_complement, city, state, postal_code, responsible, start_date, end_date_forecast, status, budget, cost, observations } = req.body;

    const db = getDatabase();
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [id]);

    if (!project) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    await db.run(
      `UPDATE projects SET name = ?, address = ?, address_number = ?, address_complement = ?, city = ?, state = ?, postal_code = ?, responsible = ?, start_date = ?, end_date_forecast = ?, status = ?, budget = ?, cost = ?, observations = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || project.name, address || project.address, address_number, address_complement, city, state, postal_code, responsible, start_date, end_date_forecast, status || project.status, budget || project.budget, cost || project.cost, observations || project.observations, id]
    );

    const updatedProject = await db.get(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.json(updatedProject);
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const project = await db.get('SELECT * FROM projects WHERE id = ?', [id]);

    if (!project) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    // Soft delete - marcar como inativo
    await db.run('UPDATE projects SET status = ? WHERE id = ?', ['finished', id]);

    res.json({ message: 'Obra deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar obra:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getProjectsByStatus(req, res) {
  try {
    const { status } = req.query;

    const db = getDatabase();
    const projects = await db.all(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.status = ?
      ORDER BY p.created_at DESC
    `, [status]);

    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar obras:', error);
    res.status(500).json({ error: error.message });
  }
}
