export const MODULE_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', path: '/' },
  { key: 'clients', label: 'Clientes', path: '/clientes' },
  { key: 'projects', label: 'Obras', path: '/obras' },
  { key: 'budgets', label: 'Orçamentos', path: '/orcamentos' },
  { key: 'documents', label: 'Documentos', path: '/documentos' },
  { key: 'employees', label: 'Colaboradores', path: '/colaboradores' },
  { key: 'contracts', label: 'Contratos', path: '/contratos' },
  { key: 'finance', label: 'Financeiro', path: '/financeiro' },
]

export const ALL_PERMISSION_KEYS = MODULE_PERMISSIONS.map((permission) => permission.key)

const DEFAULT_ROLE_PERMISSIONS = {
  admin: ALL_PERMISSION_KEYS,
  financial: ['dashboard', 'finance', 'documents', 'clients', 'projects', 'budgets'],
  operational: ['dashboard', 'clients', 'projects', 'budgets', 'documents', 'employees', 'contracts'],
}

export function normalizePermissions(value) {
  const source = Array.isArray(value) ? value : []
  const allowed = new Set(ALL_PERMISSION_KEYS)
  return [...new Set(source.filter((permission) => allowed.has(permission)))]
}

export function getDefaultPermissions(role = 'operational') {
  return DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.operational
}

export function getEffectivePermissions(user) {
  if (user?.role === 'admin') return ALL_PERMISSION_KEYS

  const customPermissions = normalizePermissions(user?.permissions)
  if (customPermissions.length > 0) {
    return customPermissions.includes('dashboard') ? customPermissions : ['dashboard', ...customPermissions]
  }

  return getDefaultPermissions(user?.role)
}

export function canAccess(user, permission) {
  if (user?.role === 'admin') return true
  return getEffectivePermissions(user).includes(permission)
}

export function getFirstAccessiblePath(user) {
  const first = MODULE_PERMISSIONS.find((permission) => canAccess(user, permission.key))
  return first?.path || '/'
}
