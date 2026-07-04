import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, 'santorini.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✓ Conectado ao banco de dados SQLite');
  }
});

db.configure('busyTimeout', 5000);
db.run('PRAGMA foreign_keys = ON');

export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de Usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          senha TEXT NOT NULL,
          nivel_acesso TEXT NOT NULL CHECK (nivel_acesso IN ('administrador', 'financeiro', 'operacional')),
          ativo BOOLEAN DEFAULT 1,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Clientes
      db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          cpf_cnpj TEXT UNIQUE NOT NULL,
          telefone TEXT,
          email TEXT,
          endereco TEXT,
          observacoes TEXT,
          ativo BOOLEAN DEFAULT 1,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Orçamentos
      db.run(`
        CREATE TABLE IF NOT EXISTS orcamentos (
          id TEXT PRIMARY KEY,
          cliente_id TEXT NOT NULL,
          tipo_servico TEXT NOT NULL,
          metragem REAL NOT NULL,
          valor_metro REAL NOT NULL,
          valor_total REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise', 'aprovado', 'recusado')),
          data_orcamento DATE NOT NULL,
          observacoes TEXT,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Obras
      db.run(`
        CREATE TABLE IF NOT EXISTS obras (
          id TEXT PRIMARY KEY,
          cliente_id TEXT NOT NULL,
          endereco TEXT NOT NULL,
          responsavel TEXT,
          data_inicio DATE NOT NULL,
          previsao_termino DATE,
          data_termino DATE,
          status TEXT NOT NULL DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'pausada', 'finalizada')),
          custos_totais REAL DEFAULT 0,
          observacoes TEXT,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Colaboradores
      db.run(`
        CREATE TABLE IF NOT EXISTS colaboradores (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          cpf TEXT UNIQUE NOT NULL,
          telefone TEXT,
          cargo TEXT NOT NULL,
          data_admissao DATE NOT NULL,
          status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Contratos
      db.run(`
        CREATE TABLE IF NOT EXISTS contratos (
          id TEXT PRIMARY KEY,
          cliente_id TEXT NOT NULL,
          obra_id TEXT,
          valor REAL NOT NULL,
          data_inicio DATE NOT NULL,
          data_final DATE NOT NULL,
          status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
          observacoes TEXT,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cliente_id) REFERENCES clientes(id),
          FOREIGN KEY (obra_id) REFERENCES obras(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Documentos
      db.run(`
        CREATE TABLE IF NOT EXISTS documentos (
          id TEXT PRIMARY KEY,
          cliente_id TEXT,
          obra_id TEXT,
          colaborador_id TEXT,
          nome_arquivo TEXT NOT NULL,
          categoria TEXT NOT NULL CHECK (categoria IN ('contrato', 'rg', 'cpf', 'nr', 'comprovante', 'orcamento', 'outro')),
          caminho_arquivo TEXT NOT NULL,
          tamanho_arquivo INTEGER,
          tipo_arquivo TEXT,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cliente_id) REFERENCES clientes(id),
          FOREIGN KEY (obra_id) REFERENCES obras(id),
          FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Financeiro (Entradas e Saídas)
      db.run(`
        CREATE TABLE IF NOT EXISTS financeiro (
          id TEXT PRIMARY KEY,
          tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
          descricao TEXT NOT NULL,
          valor REAL NOT NULL,
          data_movimento DATE NOT NULL,
          categoria TEXT NOT NULL,
          obra_id TEXT,
          forma_pagamento TEXT DEFAULT 'dinheiro',
          status TEXT DEFAULT 'realizado' CHECK (status IN ('planejado', 'realizado', 'cancelado')),
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (obra_id) REFERENCES obras(id)
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      // Tabela de Backup
      db.run(`
        CREATE TABLE IF NOT EXISTS backups (
          id TEXT PRIMARY KEY,
          data_backup DATETIME DEFAULT CURRENT_TIMESTAMP,
          nome_arquivo TEXT NOT NULL,
          caminho_arquivo TEXT NOT NULL,
          tamanho_arquivo INTEGER
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error('Erro:', err);
      });

      resolve(db);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export default db;
