import { getDatabase } from '../database/init.js';
import { generateId, hashPassword, validateEmail } from '../utils/helpers.js';
import { getEffectivePermissions, normalizePermissions, serializePermissions } from '../utils/permissions.js';

function normalizeBoolean(value) {
  return value === true || value === 1 || value === '1';
}

function formatUser(user) {
  if (!user) return user;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: normalizeBoolean(user.active),
    permissions: getEffectivePermissions(user),
    must_change_password: normalizeBoolean(user.must_change_password),
    created_at: user.created_at,
  };
}

export async function getAllUsers(req, res) {
  try {
    const db = getDatabase();
    const users = await db.all('SELECT id, name, email, role, active, permissions, must_change_password, created_at FROM users ORDER BY name');
    
    res.json(users.map(formatUser));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const user = await db.get('SELECT id, name, email, role, active, permissions, must_change_password, created_at FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(formatUser(user));
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role = 'operational', permissions = [] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
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
    const serializedPermissions = role === 'admin' ? serializePermissions([]) : serializePermissions(normalizePermissions(permissions));

    await db.run(
      `INSERT INTO users (id, name, email, password, role, active, permissions, must_change_password)
       VALUES (?, ?, ?, ?, ?, TRUE, ?, TRUE)`,
      [userId, name, email, hashedPassword, role, serializedPermissions]
    );

    const newUser = await db.get('SELECT id, name, email, role, active, permissions, must_change_password, created_at FROM users WHERE id = ?', [userId]);

    res.status(201).json(formatUser(newUser));
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, active, permissions, password } = req.body;

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

    const nextRole = role || user.role;
    const nextPermissions = nextRole === 'admin'
      ? serializePermissions([])
      : serializePermissions(permissions !== undefined ? permissions : user.permissions);

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
      }

      const hashedPassword = await hashPassword(password);

      await db.run(
        `UPDATE users
         SET name = ?, email = ?, role = ?, active = ?, permissions = ?, password = ?, must_change_password = TRUE, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name || user.name, email || user.email, nextRole, active !== undefined ? active : user.active, nextPermissions, hashedPassword, id]
      );
    } else {
      await db.run(
        `UPDATE users
         SET name = ?, email = ?, role = ?, active = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name || user.name, email || user.email, nextRole, active !== undefined ? active : user.active, nextPermissions, id]
      );
    }

    const updatedUser = await db.get('SELECT id, name, email, role, active, permissions, must_change_password, created_at FROM users WHERE id = ?', [id]);

    res.json(formatUser(updatedUser));
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
