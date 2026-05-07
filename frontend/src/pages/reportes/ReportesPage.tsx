import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import GradeStatusBadge from '../../components/common/GradeStatusBadge'
import { reportesService } from '../../services/index'
import type { RendimientoCurso, AprobadosReprobados, PromedioGrado, EstudianteRiesgo } from '../../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const PIE_COLORS = ['#059669', '#d97706', '#dc2626']

export default function ReportesPage() {
  const [rend,   setRend]   = useState<RendimientoCurso[]>([])
  const [apr,    setApr]    = useState<AprobadosReprobados | null>(null)
  const [grados, setGrados] = useState<PromedioGrado[]>([])
  const [riesgo, setRiesgo] = useState<EstudianteRiesgo[]>([])
  const [tab,    setTab]    = useState(0)

  useEffect(() => {
    Promise.all([
      reportesService.rendimientoCursos(),
      reportesService.aprobadosReprobados(),
      reportesService.promediosPorGrado(),
      reportesService.estudiantesRiesgo(),
    ]).then(([r, a, g, ri]) => { setRend(r); setApr(a); setGrados(g); setRiesgo(ri) })
      .catch(() => toast.error('Error cargando reportes'))
  }, [])

  const pieData = apr ? [
    { name: 'Aprobados', value: apr.aprobados },
    { name: 'En Riesgo', value: apr.enRiesgo },
    { name: 'Reprobados', value: apr.reprobados },
  ] : []

  const tabs = ['Rendimiento por Curso', 'Distribución', 'Promedios por Grado', 'Estudiantes en Riesgo']

  return (
    <div className="space-y-4">
      <PageHeader title="Reportes Institucionales" subtitle="Análisis académico del sistema"
        actions={<button onClick={() => window.print()} className="btn-outline"><Printer size={15}/> Imprimir</button>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card !p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{apr?.aprobados ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Aprobados</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{apr?.enRiesgo ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">En Riesgo</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{apr?.reprobados ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Reprobados</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-3xl font-bold text-primary-700 dark:text-primary-400">
            {apr ? Math.round(apr.aprobados / (apr.total || 1) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Tasa Aprobación</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-slate-700 overflow-x-auto">
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all
              ${tab === i ? 'border-primary-700 text-primary-700 dark:text-primary-400 dark:border-primary-500'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Chart panels */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        {tab === 0 && (
          <>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Rendimiento Promedio por Curso</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
                  formatter={(v: number) => [`${v.toFixed(1)}`, 'Promedio']} />
                <Bar dataKey="promedio" fill="#1d4ed8" radius={[6,6,0,0]}
                  label={{ position: 'top', fontSize: 11, formatter: (v: number) => `${v.toFixed(0)}` }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 table-container">
              <table className="table"><thead><tr><th>Curso</th><th>Promedio</th><th>Estudiantes</th><th>Estado</th></tr></thead>
                <tbody>{rend.map((r,i) => (
                  <tr key={i}><td>{r.nombre}</td><td className="font-bold">{r.promedio.toFixed(1)}</td>
                    <td>{r.estudiantes}</td>
                    <td><GradeStatusBadge estado={r.promedio >= 70 ? 'APROBADO' : r.promedio >= 60 ? 'EN_RIESGO' : 'REPROBADO'} size="sm" /></td>
                  </tr>))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {tab === 1 && (
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribución de Resultados</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: 'Aprobados (≥70)', count: apr?.aprobados ?? 0, color: 'bg-emerald-500' },
                { label: 'En Riesgo (60–69)', count: apr?.enRiesgo ?? 0, color: 'bg-amber-500' },
                { label: 'Reprobados (<60)', count: apr?.reprobados ?? 0, color: 'bg-red-500' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/40">
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.label}</span>
                      <span className="font-bold">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full">
                      <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${apr ? (s.count / apr.total * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 2 && (
          <>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Promedios por Grado</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={grados}>
                <PolarGrid />
                <PolarAngleAxis dataKey="grado" tick={{ fontSize: 10 }} />
                <Radar name="Promedio" dataKey="promedio" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {grados.map((g, i) => (
                <div key={i} className="bg-gray-50 dark:bg-slate-700/40 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{g.grado}</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{g.promedio.toFixed(1)}</p>
                  <GradeStatusBadge estado={g.promedio >= 70 ? 'APROBADO' : g.promedio >= 60 ? 'EN_RIESGO' : 'REPROBADO'} size="sm" />
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 3 && (
          <>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Estudiantes en Riesgo o Reprobados</h3>
            {riesgo.length === 0 ? <p className="text-center text-gray-400 py-8">¡Sin estudiantes en riesgo! 🎉</p> : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Estudiante</th><th>Grado</th><th>Curso</th><th>Promedio</th><th>Estado</th></tr></thead>
                  <tbody>{riesgo.map((r, i) => (
                    <tr key={i}>
                      <td className="font-medium">{r.estudiante.nombreCompleto}</td>
                      <td className="text-gray-400 text-xs">{r.estudiante.grado}</td>
                      <td>{r.curso.nombre}</td>
                      <td className="font-bold">{r.promedio.toFixed(1)}</td>
                      <td><GradeStatusBadge estado={r.estado} size="sm" /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
