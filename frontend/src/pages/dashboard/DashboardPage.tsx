import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, ClipboardList, TrendingUp, AlertTriangle, FileText, Clock, BarChart3 as BarChartIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'
import StatCard from '../../components/common/StatCard'
import GradeStatusBadge from '../../components/common/GradeStatusBadge'
import { reportesService } from '../../services/index'
import { useAuthStore } from '../../store/auth.store'
import type { DashboardData, RendimientoCurso, AprobadosReprobados, EstudianteRiesgo } from '../../types'

const PIE_COLORS = ['#059669', '#d97706', '#dc2626']

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dash,    setDash]    = useState<DashboardData | null>(null)
  const [rend,    setRend]    = useState<RendimientoCurso[]>([])
  const [apr,     setApr]     = useState<AprobadosReprobados | null>(null)
  const [riesgo,  setRiesgo]  = useState<EstudianteRiesgo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportesService.dashboard(),
      reportesService.rendimientoCursos(),
      reportesService.aprobadosReprobados(),
      reportesService.estudiantesRiesgo(),
    ]).then(([d, r, a, ri]) => {
      setDash(d); setRend(r); setApr(a); setRiesgo(ri)
    }).catch(() => toast.error('Error cargando dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const roleGreeting: Record<string, string> = {
    ADMINISTRADOR: '¡Todo bajo control, Administrador!',
    DIRECTOR: 'Resumen ejecutivo del sistema',
    DOCENTE: 'Tus cursos y actividades del día',
    SECRETARIA: 'Gestión estudiantil al día',
  }

  const pieData = apr ? [
    { name: 'Aprobados', value: apr.aprobados },
    { name: 'En Riesgo', value: apr.enRiesgo },
    { name: 'Reprobados', value: apr.reprobados },
  ] : []

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-800 to-accent-700 rounded-2xl p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">¡Buenos días, {user?.nombre?.split(' ')[0]}! 👋</h2>
        <p className="text-white/70 text-sm mt-1">{roleGreeting[user?.rol ?? '']}</p>
        <p className="text-white/50 text-xs mt-2">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Estudiantes"   value={dash?.totalEstudiantes ?? 0}  icon={Users}          color="blue"   delay={0.0} />
        <StatCard title="Cursos"        value={dash?.totalCursos ?? 0}       icon={BookOpen}        color="cyan"   delay={0.1} />
        <StatCard title="Actividades"   value={dash?.totalActividades ?? 0}  icon={ClipboardList}   color="gold"   delay={0.2} />
        <StatCard title="Aprobados"     value={apr?.aprobados ?? 0}          icon={TrendingUp}      color="green"  delay={0.3} />
        <StatCard title="En Riesgo"     value={riesgo.length}                icon={AlertTriangle}   color="red"    delay={0.4} />
        <StatCard title="Usuarios"      value={dash?.totalUsuarios ?? 0}     icon={FileText}        color="purple" delay={0.5} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChartIcon className="text-accent-600" size={18} /> Rendimiento por Curso
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rend} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: '12px' }}
                formatter={(v: number) => [`${v.toFixed(1)}`, 'Promedio']}
              />
              <Bar dataKey="promedio" fill="#0891b2" radius={[6, 6, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#6b7280', formatter: (v: number) => v.toFixed(0) }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribución</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-12">Sin datos</p>}
        </motion.div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students at risk */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Estudiantes en Riesgo
          </h3>
          <div className="space-y-2">
            {riesgo.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">¡Sin estudiantes en riesgo! 🎉</p>
            ) : riesgo.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.estudiante.nombreCompleto}</p>
                  <p className="text-xs text-gray-400">{r.curso.nombre}</p>
                </div>
                <GradeStatusBadge estado={r.estado} promedio={r.promedio} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-accent-500" /> Actividad Reciente
          </h3>
          <div className="space-y-2">
            {(dash?.ultimasNotas ?? []).slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm">
                  {n.valor}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{(n.estudiante as { nombreCompleto?: string })?.nombreCompleto}</p>
                  <p className="text-[10px] text-gray-400 truncate">{(n.actividad as { nombre?: string })?.nombre}</p>
                </div>
                <GradeStatusBadge estado={n.valor >= 70 ? 'APROBADO' : n.valor >= 60 ? 'EN_RIESGO' : 'REPROBADO'} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
