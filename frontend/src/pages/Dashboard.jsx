import React, { useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Button, Card, Loading, StatsCard } from '../components/UI'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function Icon({ children }) {
  return <span className="text-lg leading-none">{children}</span>
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    projectsInProgress: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    profit: 0,
  })
  const [chartData, setChartData] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [clients, projects, finance, budgets] = await Promise.all([
        api.get('/clients'),
        api.get('/projects'),
        api.get('/finance'),
        api.get('/budgets'),
      ])

      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyIncome = finance.data
        .filter((item) => item.type === 'income' && item.date?.startsWith(currentMonth))
        .reduce((sum, item) => sum + Number(item.value || 0), 0)
      const monthlyExpenses = finance.data
        .filter((item) => item.type === 'expense' && item.date?.startsWith(currentMonth))
        .reduce((sum, item) => sum + Number(item.value || 0), 0)

      setStats({
        totalClients: clients.data.length,
        totalProjects: projects.data.length,
        projectsInProgress: projects.data.filter((project) => project.status === 'in_progress').length,
        monthlyIncome,
        monthlyExpenses,
        profit: monthlyIncome - monthlyExpenses,
      })

      prepareChartData(finance.data, projects.data, budgets.data)
      setRecentActivities(buildActivities(projects.data, clients.data, finance.data, budgets.data))
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      prepareChartData([], [], [])
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = (finance, projects, budgets) => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))
      return date.toISOString().slice(0, 7)
    })

    const income = months.map((month) =>
      finance
        .filter((item) => item.type === 'income' && item.date?.startsWith(month))
        .reduce((sum, item) => sum + Number(item.value || 0), 0)
    )
    const expenses = months.map((month) =>
      finance
        .filter((item) => item.type === 'expense' && item.date?.startsWith(month))
        .reduce((sum, item) => sum + Number(item.value || 0), 0)
    )
    const budgetsByStatus = ['draft', 'sent', 'approved', 'rejected'].map((status) =>
      budgets.filter((budget) => budget.status === status).length
    )
    const projectStatus = ['planned', 'in_progress', 'paused', 'finished'].map((status) =>
      projects.filter((project) => project.status === status).length
    )

    setChartData({
      finance: {
        labels: months.map((month) => {
          const [year, number] = month.split('-')
          return `${number}/${year.slice(2)}`
        }),
        datasets: [
          {
            label: 'Entradas',
            data: income,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.14)',
            pointBackgroundColor: '#2563eb',
            pointRadius: 4,
            tension: 0.42,
            fill: true,
          },
          {
            label: 'Saidas',
            data: expenses,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249,115,22,0.08)',
            pointBackgroundColor: '#f97316',
            pointRadius: 4,
            tension: 0.42,
            fill: true,
          },
        ],
      },
      projects: {
        labels: ['Planejadas', 'Em andamento', 'Pausadas', 'Finalizadas'],
        datasets: [
          {
            data: projectStatus,
            backgroundColor: ['#f59e0b', '#2563eb', '#ef4444', '#10b981'],
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      },
      budgets: {
        labels: ['Rascunho', 'Enviados', 'Aprovados', 'Recusados'],
        datasets: [
          {
            data: budgetsByStatus,
            backgroundColor: ['#94a3b8', '#06b6d4', '#10b981', '#f43f5e'],
            borderRadius: 12,
            maxBarThickness: 42,
          },
        ],
      },
    })
  }

  const buildActivities = (projects, clients, finance, budgets) => {
    const items = [
      ...projects.slice(-2).map((project) => ({ title: project.name || 'Nova obra', detail: 'Obra atualizada', tone: 'blue' })),
      ...clients.slice(-1).map((client) => ({ title: client.name || 'Novo cliente', detail: 'Cliente cadastrado', tone: 'cyan' })),
      ...finance.slice(-1).map((item) => ({ title: item.description || 'Lancamento financeiro', detail: currency.format(Number(item.value || 0)), tone: item.type === 'expense' ? 'orange' : 'green' })),
      ...budgets.slice(-1).map((budget) => ({ title: budget.service_type || 'Orcamento', detail: budget.status || 'Atualizado', tone: 'slate' })),
    ]

    return items.length ? items.reverse().slice(0, 5) : [
      { title: 'Pipeline pronto para operar', detail: 'Cadastre clientes, obras e lancamentos', tone: 'blue' },
      { title: 'Painel financeiro configurado', detail: 'Os graficos atualizam com os dados da API', tone: 'green' },
      { title: 'Atalhos rapidos ativos', detail: 'Use Ctrl+D, Ctrl+C, Ctrl+O e Ctrl+F', tone: 'cyan' },
    ]
  }

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        labels: { usePointStyle: true, boxWidth: 8, color: '#64748b', font: { weight: 600 } },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 12,
        callbacks: { label: (context) => `${context.dataset.label}: ${currency.format(context.parsed.y || context.parsed)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.18)' }, ticks: { color: '#64748b', callback: (value) => currency.format(value).replace(',00', '') } },
    },
  }), [])

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 18, color: '#64748b', font: { weight: 600 } } },
      tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 12 },
    },
  }

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-premium backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <Loading size="xl" text="Preparando o painel New Santorini..." />
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="h-2 rounded-full bg-primary-100 dark:bg-cyan-400/20" />
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-2 rounded-full bg-orange-100 dark:bg-orange-400/20" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-[linear-gradient(135deg,rgba(30,58,138,0.98),rgba(37,99,235,0.94)_52%,rgba(6,182,212,0.88))] p-6 text-white shadow-premium dark:border-cyan-400/20 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-100">New Santorini</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">Dashboard executivo para obras, contratos e caixa.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">
              Indicadores operacionais, financeiro do mes e acompanhamento comercial em uma visao limpa para decisao rapida.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/14 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-cyan-100">Margem do mes</p>
              <p className="mt-2 text-2xl font-black">{stats.monthlyIncome ? Math.round((stats.profit / stats.monthlyIncome) * 100) : 0}%</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 backdrop-blur">
              <p className="text-xs font-semibold text-cyan-100">Obras totais</p>
              <p className="mt-2 text-2xl font-black">{stats.totalProjects}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Clientes ativos" value={stats.totalClients} icon={<Icon>CL</Icon>} trend="up" change="+12% no mes" />
        <StatsCard title="Obras em andamento" value={stats.projectsInProgress} icon={<Icon>OB</Icon>} trend="up" change={`${stats.totalProjects} no total`} />
        <StatsCard title="Receita mensal" value={currency.format(stats.monthlyIncome)} icon={<Icon>R$</Icon>} trend="up" change="+8% vs. periodo anterior" />
        <StatsCard title="Resultado liquido" value={currency.format(stats.profit)} icon={<Icon>{stats.profit >= 0 ? '+' : '-'}</Icon>} trend={stats.profit >= 0 ? 'up' : 'down'} change={stats.profit >= 0 ? 'Operacao positiva' : 'Atenção ao caixa'} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Card title="Fluxo financeiro" variant="premium" hover={false}>
          <div className="h-80">{chartData ? <Line data={chartData.finance} options={chartOptions} /> : null}</div>
        </Card>
        <Card title="Status das obras" variant="premium" hover={false}>
          <div className="h-80">{chartData ? <Doughnut data={chartData.projects} options={doughnutOptions} /> : null}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr_0.8fr]">
        <Card title="Orcamentos por fase" hover={false}>
          <div className="h-64">{chartData ? <Bar data={chartData.budgets} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} /> : null}</div>
        </Card>

        <Card title="Atividades recentes" hover={false}>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={`${activity.title}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-3 transition hover:bg-white hover:shadow-card dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-900">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-xs font-black text-primary-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{activity.title}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{activity.detail}</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Atalhos rapidos" variant="elevated" hover={false}>
          <div className="grid gap-3">
            <Button variant="outline" className="justify-start">Novo cliente</Button>
            <Button variant="outline" className="justify-start">Nova obra</Button>
            <Button variant="outline" className="justify-start">Novo orcamento</Button>
            <Button variant="premium" className="justify-start">Relatorio executivo</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
