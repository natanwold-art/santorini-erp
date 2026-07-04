import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';
import { generateId, hashPassword, comparePassword, validateEmail } from '../utils/helpers.js';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

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
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const userId = generateId();
    const hashedPassword = await hashPassword(password);
    const userRole = role || 'operational';

    await db.run(
      'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [userId, name, email, hashedPassword, userRole]
    );

    const token = jwt.sign(
      { id: userId, email, name, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: { id: userId, name, email, role: userRole }
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

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
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
