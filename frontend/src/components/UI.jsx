import React from 'react'

export function Loading({ size = 'md', text = 'Carregando...', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative grid place-items-center">
        <div className={`${sizes[size]} rounded-full border-2 border-primary-100 border-t-primary-600 animate-spin dark:border-slate-700 dark:border-t-cyan-300`} />
        <div className="absolute h-2 w-2 rounded-full bg-primary-600 shadow-[0_0_26px_rgba(37,99,235,0.85)] dark:bg-cyan-300" />
      </div>
      {text ? <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{text}</p> : null}
    </div>
  )
}

export function Skeleton({ className = '', variant = 'rectangle' }) {
  const variants = {
    rectangle: 'rounded-xl',
    circle: 'rounded-full',
    text: 'h-4 rounded',
  }

  return (
    <div
      className={`animate-shimmer bg-[linear-gradient(90deg,#e2e8f0_25%,#f8fafc_37%,#e2e8f0_63%)] bg-[length:400%_100%] dark:bg-[linear-gradient(90deg,#1e293b_25%,#334155_37%,#1e293b_63%)] ${variants[variant]} ${className}`}
    />
  )
}

export function Card({ title, children, className = '', variant = 'default', hover = true }) {
  const variants = {
    default: 'border border-slate-200/80 bg-white/90 shadow-card dark:border-slate-800 dark:bg-slate-900/78',
    elevated: 'border border-white/70 bg-white shadow-card-lg dark:border-slate-800 dark:bg-slate-900',
    premium:
      'border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-card-lg dark:border-slate-800 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.98),rgba(30,41,59,0.86))]',
  }
  const hoverEffect = hover ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-xl' : ''

  return (
    <section className={`rounded-2xl p-5 backdrop-blur ${variants[variant] || variants.default} ${hoverEffect} ${className}`}>
      {title ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
          <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.7)]" />
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-cyan-300 dark:focus:ring-offset-slate-950'
  const variants = {
    primary: 'bg-primary-600 text-white shadow-soft hover:bg-primary-700 hover:-translate-y-0.5',
    secondary: 'bg-slate-800 text-white shadow-soft hover:bg-slate-950 dark:bg-slate-700 dark:hover:bg-slate-600',
    danger: 'bg-rose-600 text-white shadow-soft hover:bg-rose-700',
    success: 'bg-emerald-600 text-white shadow-soft hover:bg-emerald-700',
    warning: 'bg-amber-500 text-slate-950 shadow-soft hover:bg-amber-400',
    outline:
      'border border-slate-300 bg-white/80 text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-100',
    ghost:
      'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
    premium:
      'bg-[linear-gradient(135deg,#1e3a8a,#2563eb_55%,#06b6d4)] text-white shadow-premium hover:-translate-y-0.5 hover:shadow-premium-lg',
  }
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-7 py-4 text-lg',
  }

  return (
    <button className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} disabled={loading} {...props}>
      {loading ? <Loading size="sm" text="" /> : icon ? <span className="text-base leading-none">{icon}</span> : null}
      {children}
    </button>
  )
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <button className="fixed inset-0 cursor-default bg-slate-950/55 backdrop-blur-sm" onClick={onClose} aria-label="Fechar modal" />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full ${sizes[size]} animate-scale-in overflow-hidden rounded-2xl border border-white/70 bg-white shadow-premium-xl dark:border-slate-800 dark:bg-slate-900`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white">
              x
            </button>
          </div>
          <div className="max-h-[78vh] overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function Input({ label, error, icon, className = '', type = 'text', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label ? <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label> : null}
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{icon}</span> : null}
        <input
          type={type}
          className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-cyan-300 dark:focus:ring-cyan-400/10 ${icon ? 'pl-10' : ''} ${error ? 'border-rose-500 focus:ring-rose-100' : ''}`}
          {...props}
        />
      </div>
      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
    </div>
  )
}

export function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    primary: 'bg-primary-50 text-primary-700 dark:bg-cyan-400/10 dark:text-cyan-200',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200',
  }
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return <span className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}>{children}</span>
}

export function StatsCard({ title, value, change, icon, trend = 'neutral' }) {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-300',
    down: 'text-rose-600 dark:text-rose-300',
    neutral: 'text-slate-500 dark:text-slate-400',
  }

  return (
    <Card variant="elevated" className="group overflow-hidden">
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary-500/10 blur-2xl transition group-hover:bg-cyan-400/20" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">{value}</p>
          {change ? <p className={`mt-2 text-sm font-semibold ${trendColors[trend]}`}>{change}</p> : null}
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-700 shadow-inner dark:bg-cyan-400/10 dark:text-cyan-200">
          {icon}
        </div>
      </div>
    </Card>
  )
}

export function Table({ headers, columns, data = [], loading = false, onEdit, onDelete }) {
  const tableHeaders = headers || columns || []

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {tableHeaders.map((header) => <th key={header}>{header}</th>)}
              {(onEdit || onDelete) && <th>Acoes</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const values = Array.isArray(row) ? row : Object.values(row)
              return (
                <tr key={row.id || idx}>
                  {values.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                  {(onEdit || onDelete) && (
                    <td className="flex gap-2">
                      {onEdit ? <Button size="sm" variant="outline" onClick={() => onEdit(row.id)}>Editar</Button> : null}
                      {onDelete ? <Button size="sm" variant="danger" onClick={() => onDelete(row.id)}>Deletar</Button> : null}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default { Card, Button, Modal, Input, Loading, Skeleton, Badge, StatsCard, Table }
