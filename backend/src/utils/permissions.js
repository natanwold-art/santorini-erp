export const PERMISSION_KEYS = [
  'dashboard',
  'clients',
  'projects',
  'budgets',
  'documents',
  'employees',
  'contracts',
  'finance',
];

const DEFAULT_ROLE_PERMISSIONS = {
  admin: PERMISSION_KEYS,
  financial: ['dashboard', 'finance', 'documents', 'clients', 'projects', 'budgets'],
  operational: ['dashboard', 'clients', 'projects', 'budgets', 'documents', 'employees', 'contracts'],
};

function parsePermissions(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(',').map((item) => item.trim());
    }
  }

  return [];
}

export function normalizePermissions(value) {
  const allowed = new Set(PERMISSION_KEYS);
  const normalized = parsePermissions(value).filter((permission) => allowed.has(permission));

  return [...new Set(normalized)];
}

export function getDefaultPermissions(role = 'operational') {
  return DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.operational;
}

export function getEffectivePermissions(user) {
  if (user?.role === 'admin') {
    return PERMISSION_KEYS;
  }

  const customPermissions = normalizePermissions(user?.permissions);

  if (customPermissions.length > 0) {
    return customPermissions.includes('dashboard') ? customPermissions : ['dashboard', ...customPermissions];
  }

  return getDefaultPermissions(user?.role);
}

export function serializePermissions(value) {
  return JSON.stringify(normalizePermissions(value));
}

export function canAccessPermission(user, permission) {
  if (user?.role === 'admin') return true;
  return getEffectivePermissions(user).includes(permission);
}
