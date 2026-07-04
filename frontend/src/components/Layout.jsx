import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from './UI'

const icons = {
  dashboard: 'M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z',
  clients: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0M18 8a3 3 0 0 1 0 6M20 20a6 6 0 0 0-3-5.2',
  projects: 'M4 20V8l8-4 8 4v12M9 20v-7h6v7M4 11h16',
  budgets: 'M7 3h10l3 3v15H7V3Zm10 0v4h4M10 12h7M10 16h7',
  documents: 'M6 3h9l5 5v13H6V3Zm9 0v6h5M9 13h8M9 17h5',
  employees: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0M17 11l2 2 4-5',
  contracts: 'M8 3h8l4 4v14H8V3Zm8 0v5h4M11 13h6M11 17h6M4 7v14',
  finance: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6',
  users: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0M19 8v6M16 11h6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  search: 'M11 19a8 8 0 1 1 5.3-2L21 21',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  moon: 'M21 12.7A8 8 0 1 1 11.3 3 6 6 0 0 0 21 12.7Z',
  sun: 'M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  logout: 'M10 17l5-5-5-5M15 12H3M21 3v18h-7',
}

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  )
}

function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#1e3a8a,#2563eb_55%,#06b6d4)] text-lg font-black text-white shadow-premium">
        S
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-lg font-black tracking-tight text-slate-950 dark:text-white">Santorini</p>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">ERP Empresarial</p>
        </div>
      ) : null}
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const menuItems = useMemo(() => [
    { label: 'Dashboard', icon: 'dashboard', path: '/', shortcut: 'Ctrl+D' },
    { label: 'Clientes', icon: 'clients', path: '/clientes', shortcut: 'Ctrl+C' },
    { label: 'Obras', icon: 'projects', path: '/obras', shortcut: 'Ctrl+O' },
    { label: 'Orcamentos', icon: 'budgets', path: '/orcamentos', shortcut: 'Ctrl+B' },
    { label: 'Documentos', icon: 'documents', path: '/documentos', shortcut: 'Ctrl+U' },
    { label: 'Colaboradores', icon: 'employees', path: '/colaboradores', shortcut: 'Ctrl+E' },
    { label: 'Contratos', icon: 'contracts', path: '/contratos', shortcut: 'Ctrl+T' },
    { label: 'Financeiro', icon: 'finance', path: '/financeiro', shortcut: 'Ctrl+F' },
    ...(user?.role === 'admin' ? [{ label: 'Usuarios', icon: 'users', path: '/usuarios', shortcut: 'Ctrl+Y' }] : []),
  ], [user?.role])

  const quickActions = [
    { label: 'Novo cliente', path: '/clientes', icon: 'clients' },
    { label: 'Nova obra', path: '/obras', icon: 'projects' },
    { label: 'Orcamento', path: '/orcamentos', icon: 'budgets' },
    { label: 'Lancamento', path: '/financeiro', icon: 'finance' },
  ]

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setDarkMode(shouldUseDark)
    document.documentElement.classList.toggle('dark', shouldUseDark)
  }, [])

  useEffect(() => {
    const shortcuts = {
      d: '/',
      c: '/clientes',
      o: '/obras',
      b: '/orcamentos',
      u: '/documentos',
      e: '/colaboradores',
      t: '/contratos',
      f: '/financeiro',
      y: '/usuarios',
    }

    const handler = (event) => {
      const path = shortcuts[event.key.toLowerCase()]
      if (event.ctrlKey && path) {
        event.preventDefault()
        navigate(path)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [navigate])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const activeLabel = menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'

  const sidebar = (
    <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} flex h-full flex-col border-r border-slate-200/80 bg-white/92 shadow-sidebar backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/88`}>
      <div className="flex h-20 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
        <Logo compact={!sidebarOpen} />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 lg:grid dark:hover:bg-slate-800 dark:hover:text-white">
          <Icon name="menu" className="h-4 w-4" />
        </button>
      </div>

      {sidebarOpen ? (
        <div className="border-b border-slate-200/80 p-4 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)} className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-card dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-cyan-400/40 dark:hover:bg-slate-900">
                <Icon name={action.icon} className="mb-2 h-4 w-4 text-primary-600 dark:text-cyan-300" />
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? 'bg-primary-50 text-primary-700 shadow-inner-premium dark:bg-cyan-400/10 dark:text-cyan-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'} ${sidebarOpen ? '' : 'justify-center'}`}
            >
              <Icon name={item.icon} className="h-5 w-5 shrink-0" />
              {sidebarOpen ? (
                <>
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[11px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100">{item.shortcut}</span>
                </>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
        <div className={`flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900 ${sidebarOpen ? '' : 'justify-center'}`}>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-cyan-400 dark:text-slate-950">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {sidebarOpen ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{user?.name || 'Usuario'}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.role === 'admin' ? 'Administrador' : 'Operacao'}</p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden lg:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/82 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/76 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800">
                <Icon name="menu" />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Santorini ERP</p>
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white">{activeLabel}</h1>
              </div>
            </div>

            <div className="hidden min-w-[280px] max-w-md flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-400 md:flex dark:border-slate-800 dark:bg-slate-900">
              <Icon name="search" className="h-4 w-4" />
              <input className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200" placeholder="Buscar clientes, obras, contratos..." />
            </div>

            <div className="flex items-center gap-2">
              <button className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                <Icon name="bell" className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 dark:border-slate-950" />
              </button>
              <button onClick={toggleDarkMode} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                <Icon name={darkMode ? 'sun' : 'moon'} className="h-5 w-5" />
              </button>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login') }} className="hidden sm:inline-flex">
                <Icon name="logout" className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_32%),linear-gradient(180deg,#f8fafc,#eef2f7)] p-4 dark:bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] lg:p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
