import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createSchema } from './schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

function convertSqlitePlaceholders(sql) {
  let index = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  return sql.replace(/['"?]/g, (char) => {
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      return char;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      return char;
    }

    if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      index += 1;
      return `$${index}`;
    }

    return char;
  });
}

function normalizePostgresSql(sql) {
  return convertSqlitePlaceholders(sql)
    .replace(/strftime\('%Y-%m',\s*([^)]+)\)/gi, "TO_CHAR($1, 'YYYY-MM')")
    .replace(/\bactive\s*=\s*1\b/gi, 'active = TRUE')
    .replace(/\bactive\s*=\s*0\b/gi, 'active = FALSE');
}

async function createPostgresDatabase() {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  await pool.query('SELECT 1');
  console.log('Banco de dados PostgreSQL conectado');

  return {
    async exec(sql) {
      await pool.query(sql);
    },

    async run(sql, params = []) {
      const result = await pool.query(normalizePostgresSql(sql), params);
      return { changes: result.rowCount };
    },

    async get(sql, params = []) {
      const result = await pool.query(normalizePostgresSql(sql), params);
      return result.rows[0];
    },

    async all(sql, params = []) {
      const result = await pool.query(normalizePostgresSql(sql), params);
      return result.rows;
    },

    async close() {
      await pool.end();
    },
  };
}

export async function initializeDatabase() {
  if (db) return db;

  try {
    if (process.env.DATABASE_URL) {
      db = await createPostgresDatabase();
    } else {
      db = await open({
        filename: process.env.DB_PATH || join(__dirname, '../../santorini.db'),
        driver: sqlite3.Database,
      });

      await db.exec('PRAGMA foreign_keys = ON');
      console.log('Banco de dados SQLite conectado');
    }

    await createSchema(db);
    console.log('Schema criado com sucesso');

    return db;
  } catch (error) {
    console.error('Erro ao conectar ao banco:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database nao inicializado. Chame initializeDatabase() primeiro.');
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
    console.log('Banco de dados fechado');
  }
}
