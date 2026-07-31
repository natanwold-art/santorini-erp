import AdmZip from 'adm-zip';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, closeDatabase } from '../database/init.js';
import { generateId } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const MAX_STORED_NAME_LENGTH = 180;

const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.zip': 'application/zip',
};

const MOJIBAKE_REPLACEMENTS = [
  ['Ã‡', 'Ç'],
  ['Ã§', 'ç'],
  ['Ã£', 'ã'],
  ['Ã¡', 'á'],
  ['Ã¢', 'â'],
  ['Ãª', 'ê'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ã´', 'ô'],
  ['Ãµ', 'õ'],
  ['Ãº', 'ú'],
  ['Ã�', 'Á'],
  ['Ã‰', 'É'],
  ['Ã“', 'Ó'],
  ['â€“', '-'],
  ['â€”', '-'],
  ['Âº', 'º'],
  ['Âª', 'ª'],
];

function parseArgs(argv) {
  const args = {
    source: '',
    dryRun: false,
    limit: 0,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--source' || arg === '--zip') {
      args.source = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--limit') {
      args.limit = Number(argv[index + 1] || 0);
      index += 1;
    } else if (!args.source) {
      args.source = arg;
    }
  }

  return args;
}

function repairMojibake(value = '') {
  let text = String(value || '');
  for (const [broken, fixed] of MOJIBAKE_REPLACEMENTS) {
    text = text.replaceAll(broken, fixed);
  }
  return text;
}

function toComparableText(value = '') {
  return repairMojibake(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function toPosixPath(value = '') {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

function normalizeEntryPath(value = '') {
  const parts = toPosixPath(value)
    .split('/')
    .filter(Boolean);

  if (parts.some((part) => part === '..' || part.includes('\0'))) {
    return '';
  }

  return parts.join('/');
}

function isIgnoredPath(relativePath) {
  const normalized = toComparableText(relativePath);
  const fileName = path.posix.basename(normalized);

  return (
    !relativePath ||
    normalized.startsWith('__macosx/') ||
    normalized.includes('/__macosx/') ||
    fileName === '.ds_store' ||
    fileName === 'thumbs.db'
  );
}

function naturalCompare(left, right) {
  return left.localeCompare(right, 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
}

function sanitizeStoredFileName(fileName) {
  const repaired = repairMojibake(fileName)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  const safeName = repaired || 'documento';

  if (safeName.length <= MAX_STORED_NAME_LENGTH) {
    return safeName;
  }

  const extension = path.extname(safeName);
  const baseName = path.basename(safeName, extension);
  const maxBaseLength = Math.max(20, MAX_STORED_NAME_LENGTH - extension.length);

  return `${baseName.slice(0, maxBaseLength)}${extension}`;
}

function getMimeType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  return MIME_TYPES[extension] || 'application/octet-stream';
}

function inferCategory(relativePath) {
  const text = toComparableText(relativePath);

  if (text.includes('orcamento')) return 'budget';
  if (text.includes('contrato')) return 'contract';
  if (text.includes('comprovante') || text.includes('recibo') || text.includes('pagamento')) return 'proof';
  if (text.includes('cpf')) return 'cpf';
  if (text.includes('rg')) return 'rg';
  if (/(^|[/\s_-])nr([/\s_-]|$)/.test(text)) return 'nr';

  return 'other';
}

function getFolderPath(relativePath) {
  const folder = path.posix.dirname(relativePath);
  return folder === '.' ? '' : folder;
}

function getHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function getCreatedAt(baseDate, globalOrder) {
  return new Date(baseDate.getTime() - (globalOrder - 1) * 1000).toISOString();
}

function getStoredPath(uploadDir, globalOrder, originalFileName) {
  const safeName = sanitizeStoredFileName(originalFileName);
  const sequence = String(globalOrder).padStart(5, '0');
  const prefix = Date.now();

  return path.join(uploadDir, `${prefix}-${sequence}-${safeName}`);
}

function collectDirectoryFiles(sourceDir) {
  const files = [];

  function walk(currentDir, relativeDir = '') {
    const entries = fs
      .readdirSync(currentDir, { withFileTypes: true })
      .sort((left, right) => naturalCompare(left.name, right.name));

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = normalizeEntryPath(path.join(relativeDir, entry.name));

      if (entry.isDirectory()) {
        walk(fullPath, relativePath);
        continue;
      }

      if (entry.isFile() && !isIgnoredPath(relativePath)) {
        const stats = fs.statSync(fullPath);
        files.push({
          relativePath,
          size: stats.size,
          readBuffer: () => fs.readFileSync(fullPath),
        });
      }
    }
  }

  walk(sourceDir);
  return files;
}

function collectZipFiles(sourceZip) {
  const zip = new AdmZip(sourceZip);

  return zip
    .getEntries()
    .filter((entry) => !entry.isDirectory)
    .map((entry) => ({
      entry,
      relativePath: normalizeEntryPath(entry.entryName),
      size: entry.header?.size || 0,
    }))
    .filter((file) => !isIgnoredPath(file.relativePath))
    .map((file) => ({
      relativePath: file.relativePath,
      size: file.size,
      readBuffer: () => file.entry.getData(),
    }));
}

function collectFiles(source) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    return collectDirectoryFiles(source);
  }

  if (stats.isFile() && path.extname(source).toLowerCase() === '.zip') {
    return collectZipFiles(source);
  }

  throw new Error('Use --source com uma pasta ou um arquivo .zip.');
}

function summarize(files) {
  const byExtension = new Map();
  const byCategory = new Map();

  for (const file of files) {
    const extension = path.extname(file.relativePath).toLowerCase() || '(sem extensao)';
    const category = inferCategory(file.relativePath);

    byExtension.set(extension, (byExtension.get(extension) || 0) + 1);
    byCategory.set(category, (byCategory.get(category) || 0) + 1);
  }

  return {
    byExtension: [...byExtension.entries()].sort((left, right) => right[1] - left[1]),
    byCategory: [...byCategory.entries()].sort((left, right) => right[1] - left[1]),
  };
}

async function findDuplicate(db, fileName, fileSize, hash) {
  return db.get(
    'SELECT id FROM documents WHERE file_name = ? AND file_size = ? AND observations LIKE ?',
    [fileName, fileSize, `%SHA256: ${hash}%`]
  );
}

async function importDocuments({ source, dryRun, limit }) {
  const sourcePath = path.resolve(source);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Origem nao encontrada: ${sourcePath}`);
  }

  let files = collectFiles(sourcePath);
  if (limit > 0) {
    files = files.slice(0, limit);
  }

  const summary = summarize(files);

  console.log(`Origem: ${sourcePath}`);
  console.log(`Arquivos encontrados: ${files.length}`);
  console.log(`Por extensao: ${summary.byExtension.map(([key, count]) => `${key}=${count}`).join(', ')}`);
  console.log(`Por categoria: ${summary.byCategory.map(([key, count]) => `${key}=${count}`).join(', ')}`);

  if (dryRun) {
    console.log('Dry run ativo. Nenhum arquivo foi copiado e nenhum registro foi criado.');
    return;
  }

  const uploadDir = path.resolve(DEFAULT_UPLOAD_DIR);
  fs.mkdirSync(uploadDir, { recursive: true });

  const db = await initializeDatabase();
  const folderCounts = new Map();
  const baseDate = new Date();
  const result = {
    imported: 0,
    skipped: 0,
  };

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const globalOrder = index + 1;
      const originalPath = repairMojibake(file.relativePath);
      const folderPath = repairMojibake(getFolderPath(file.relativePath));
      const originalFileName = repairMojibake(path.posix.basename(file.relativePath));
      const folderOrder = (folderCounts.get(folderPath) || 0) + 1;

      folderCounts.set(folderPath, folderOrder);

      const buffer = file.readBuffer();
      const hash = getHash(buffer);
      const duplicate = await findDuplicate(db, originalFileName, buffer.length, hash);

      if (duplicate) {
        result.skipped += 1;
        console.log(`SKIP ${globalOrder}/${files.length}: ${originalPath}`);
        continue;
      }

      const storedPath = getStoredPath(uploadDir, globalOrder, originalFileName);
      const observations = [
        'Importado automaticamente',
        `Origem: ${originalPath}`,
        `Pasta: ${folderPath || '(raiz)'}`,
        `Ordem na pasta: ${folderOrder}`,
        `SHA256: ${hash}`,
      ].join('\n');

      fs.writeFileSync(storedPath, buffer, { flag: 'wx' });

      await db.run(
        `INSERT INTO documents (id, file_name, file_path, file_size, file_type, category, client_id, project_id, employee_id, observations, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          originalFileName,
          storedPath,
          buffer.length,
          getMimeType(originalFileName),
          inferCategory(originalPath),
          null,
          null,
          null,
          observations,
          getCreatedAt(baseDate, globalOrder),
        ]
      );

      result.imported += 1;
      console.log(`OK ${globalOrder}/${files.length}: ${originalPath}`);
    }
  } finally {
    await closeDatabase();
  }

  console.log(`Importados: ${result.imported}`);
  console.log(`Ignorados por duplicidade: ${result.skipped}`);
  console.log(`Uploads: ${uploadDir}`);
}

const args = parseArgs(process.argv.slice(2));

if (!args.source) {
  console.error('Uso: npm run import:documents -- --source "Caminho/para/documentos.zip"');
  process.exit(1);
}

importDocuments(args).catch(async (error) => {
  console.error('Erro ao importar documentos:', error.message);
  await closeDatabase().catch(() => {});
  process.exit(1);
});
