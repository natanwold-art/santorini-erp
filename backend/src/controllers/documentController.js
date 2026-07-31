import { getDatabase } from '../database/init.js';
import { generateId } from '../utils/helpers.js';
import fs from 'fs';
import path from 'path';

const TEXT_EXTENSIONS = new Set(['.txt', '.csv', '.json', '.md', '.log', '.xml', '.html', '.css', '.js']);
const MAX_TEXT_PREVIEW_CHARS = 60000;

function repairMojibake(value = '') {
  return String(value)
    .replace(/Ã‡/g, 'Ç')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ãƒ/g, 'Ã')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã¢/g, 'â')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã´/g, 'ô')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã�/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã“/g, 'Ó')
    .replace(/â€“/g, '-')
    .replace(/â€”/g, '-')
    .replace(/Âº/g, 'º')
    .replace(/Âª/g, 'ª');
}

function limitPreviewText(text) {
  if (!text) return '';
  if (text.length <= MAX_TEXT_PREVIEW_CHARS) return text;
  return `${text.slice(0, MAX_TEXT_PREVIEW_CHARS)}\n\n[Texto truncado para pré-visualização]`;
}

function getInlineContentDisposition(fileName) {
  const cleanFileName = repairMojibake(fileName).replace(/[\r\n"]/g, '').trim() || 'documento';
  return `inline; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`;
}

function getDocumentPath(document) {
  return path.resolve(document.file_path);
}

async function extractDocumentText(document) {
  const filePath = getDocumentPath(document);
  const extension = path.extname(document.file_name || document.file_path).toLowerCase();
  const mimeType = document.file_type || '';

  if (extension === '.pdf' || mimeType === 'application/pdf') {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: fs.readFileSync(filePath) });
    try {
      const data = await parser.getText();
      return { supported: true, kind: 'pdf', text: limitPreviewText(data.text || '') };
    } finally {
      await parser.destroy();
    }
  }

  if (extension === '.docx' || mimeType.includes('wordprocessingml.document')) {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ path: filePath });
    return { supported: true, kind: 'docx', text: limitPreviewText(result.value || '') };
  }

  if (mimeType.startsWith('text/') || TEXT_EXTENSIONS.has(extension)) {
    const text = fs.readFileSync(filePath, 'utf8');
    return { supported: true, kind: 'text', text: limitPreviewText(text) };
  }

  return {
    supported: false,
    kind: 'unsupported',
    text: 'Leitura textual indisponível para este formato. Use a pré-visualização ou o download do arquivo.',
  };
}

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
    const fileName = repairMojibake(req.file.originalname);
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

    res.download(filePath, repairMojibake(document.file_name));
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function previewDocumentFile(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const filePath = getDocumentPath(document);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', getInlineContentDisposition(document.file_name));
    res.sendFile(filePath);
  } catch (error) {
    console.error('Erro ao pre-visualizar documento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function readDocument(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const document = await db.get('SELECT * FROM documents WHERE id = ?', [id]);

    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const filePath = getDocumentPath(document);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    const preview = await extractDocumentText(document);

    res.json({
      id: document.id,
      file_name: repairMojibake(document.file_name),
      file_type: document.file_type,
      supported: preview.supported,
      kind: preview.kind,
      text: preview.text,
    });
  } catch (error) {
    console.error('Erro ao ler documento:', error);
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
