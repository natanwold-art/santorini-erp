import { getDatabase } from '../database/init.js';
import { generateId } from '../utils/helpers.js';
import fs from 'fs';
import path from 'path';

export async function getAllDocuments(req, res) {
  try {
    const db = getDatabase();
    const documents = await db.all(`
      SELECT d.*, c.name as client_name, p.name as project_name, e.name as employee_name
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN employees e ON d.employee_id = e.id
      ORDER BY d.created_at DESC
    `);
    
    res.json(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const document = await db.get(`
      SELECT d.*, c.name as client_name, p.name as project_name, e.name as employee_name
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN employees e ON d.employee_id = e.id
      WHERE d.id = ?
    `, [id]);
    
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    res.json(document);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const { category, client_id, project_id, employee_id, observations } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Categoria é obrigatória' });
    }

    const db = getDatabase();
    const id = generateId();
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;

    await db.run(
      `INSERT INTO documents (id, file_name, file_path, file_size, file_type, category, client_id, project_id, employee_id, observations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, fileName, filePath, fileSize, fileType, category, client_id || null, project_id || null, employee_id || null, observations]
    );

    const newDocument = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function downloadDocument(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const filePath = document.file_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    res.download(filePath, document.file_name);
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Deletar arquivo fisicamente
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Deletar registro do banco
    await db.run('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Documento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getDocumentsByEntity(req, res) {
  try {
    const { entityType, entityId } = req.params;

    const db = getDatabase();
    let documents;

    if (entityType === 'client') {
      documents = await db.all('SELECT * FROM documents WHERE client_id = ? ORDER BY created_at DESC', [entityId]);
    } else if (entityType === 'project') {
      documents = await db.all('SELECT * FROM documents WHERE project_id = ? ORDER BY created_at DESC', [entityId]);
    } else if (entityType === 'employee') {
      documents = await db.all('SELECT * FROM documents WHERE employee_id = ? ORDER BY created_at DESC', [entityId]);
    } else {
      return res.status(400).json({ error: 'Tipo de entidade inválido' });
    }

    res.json(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: error.message });
  }
}
