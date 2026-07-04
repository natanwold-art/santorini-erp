import { getDatabase } from '../database/init.js';
import { generateId, hashPassword, validateEmail } from '../utils/helpers.js';

export async function getAllUsers(req, res) {
  try {
    const db = getDatabase();
    const users = await db.all('SELECT id, name, email, role, active, created_at FROM users ORDER BY name');
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const user = await db.get('SELECT id, name, email, role, active, created_at FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!['admin', 'financial', 'operational'].includes(role)) {
      return res.status(400).json({ error: 'Papel inválido' });
    }

    const db = getDatabase();
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const userId = generateId();
    const hashedPassword = await hashPassword(password);

    await db.run(
      'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [userId, name, email, hashedPassword, role]
    );

    const newUser = await db.get('SELECT id, name, email, role, active, created_at FROM users WHERE id = ?', [userId]);

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, active } = req.body;

    const db = getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (email && email !== user.email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    if (role && !['admin', 'financial', 'operational'].includes(role)) {
      return res.status(400).json({ error: 'Papel inválido' });
    }

    await db.run(
      `UPDATE users SET name = ?, email = ?, role = ?, active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || user.name, email || user.email, role || user.role, active !== undefined ? active : user.active, id]
    );

    const updatedUser = await db.get('SELECT id, name, email, role, active, created_at FROM users WHERE id = ?', [id]);

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await db.run('UPDATE users SET active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: error.message });
  }
}
