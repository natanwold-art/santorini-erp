import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';
import { generateId, hashPassword, comparePassword, validateEmail } from '../utils/helpers.js';
import { getEffectivePermissions, serializePermissions } from '../utils/permissions.js';

function normalizeBoolean(value) {
  return value === true || value === 1 || value === '1';
}

function buildAuthPayload(user) {
  const authUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: getEffectivePermissions(user),
    must_change_password: normalizeBoolean(user.must_change_password),
  };

  const token = jwt.sign(authUser, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { token, user: authUser };
}

export async function getSetupStatus(req, res) {
  try {
    const db = getDatabase();
    const result = await db.get('SELECT COUNT(*) as total FROM users');

    res.json({ needs_setup: Number(result.total) === 0 });
  } catch (error) {
    console.error('Erro ao verificar setup:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const db = getDatabase();
    const userCount = await db.get('SELECT COUNT(*) as total FROM users');

    if (Number(userCount.total) > 0) {
      return res.status(403).json({ error: 'Cadastro público desativado. Apenas administradores podem criar usuários.' });
    }

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const userId = generateId();
    const hashedPassword = await hashPassword(password);
    const userRole = 'admin';

    await db.run(
      `INSERT INTO users (id, name, email, password, role, active, permissions, must_change_password)
       VALUES (?, ?, ?, ?, ?, TRUE, ?, FALSE)`,
      [userId, name, email, hashedPassword, userRole, serializePermissions([])]
    );

    const newUser = await db.get('SELECT id, name, email, role, permissions, must_change_password FROM users WHERE id = ?', [userId]);
    const { token, user } = buildAuthPayload(newUser);

    res.status(201).json({
      message: 'Administrador criado com sucesso',
      token,
      user
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const db = getDatabase();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND active = TRUE', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const { token, user: authUser } = buildAuthPayload(user);

    res.json({
      token,
      user: authUser
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({ error: 'Confirmação de senha não confere' });
    }

    const db = getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ? AND active = TRUE', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const passwordMatch = await comparePassword(current_password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const hashedPassword = await hashPassword(new_password);

    await db.run(
      'UPDATE users SET password = ?, must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, user.id]
    );

    const updatedUser = await db.get(
      'SELECT id, name, email, role, permissions, must_change_password FROM users WHERE id = ?',
      [user.id]
    );
    const { token, user: authUser } = buildAuthPayload(updatedUser);

    res.json({
      message: 'Senha alterada com sucesso',
      token,
      user: authUser,
    });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function validateToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }

      res.json({ valid: true, user: decoded });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
