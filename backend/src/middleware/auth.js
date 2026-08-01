import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';
import { canAccessPermission, getEffectivePermissions } from '../utils/permissions.js';

function normalizeBoolean(value) {
  return value === true || value === 1 || value === '1';
}

function isPasswordChangeRoute(req) {
  return req.originalUrl === '/api/auth/change-password';
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, name, email, role, active, permissions, must_change_password FROM users WHERE id = ? AND active = TRUE',
      [decoded.id]
    );

    if (!user) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    const mustChangePassword = normalizeBoolean(user.must_change_password);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: getEffectivePermissions(user),
      must_change_password: mustChangePassword,
    };

    if (mustChangePassword && !isPasswordChangeRoute(req)) {
      return res.status(403).json({
        error: 'Troca de senha obrigatória antes de continuar',
        must_change_password: true,
      });
    }

    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado. Papel insuficiente.' });
    }
    next();
  };
}

export function authorizePermission(permission) {
  return (req, res, next) => {
    if (!req.user || !canAccessPermission(req.user, permission)) {
      return res.status(403).json({ error: 'Acesso negado para este módulo.' });
    }

    next();
  };
}
