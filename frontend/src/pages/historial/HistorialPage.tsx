import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import GradeStatusBadge from '../../components/common/GradeStatusBadge'
import { estudiantesService } from '../../services/estudiantes.service'
import { notasService } from '../../services/index'
import type { Estudiante } from '../../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function HistorialPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [estSel,      setEstSel]      = useState('')
  const [historial,   setHistorial]   = useState<unknown[]>([])
  const [promedios,   setPromedios]   = useState<unknown[]>([])
  const [loading,     setLoading]     = useState(false)

  useEffect(() => { estudiantesService.listar().then(setEstudiantes).catch(() => {}) }, [])

  const buscar = async () => {
    if (!estSel) { toast.error('Selecciona un estudiante'); return }
    setLoading(true)
    try {
      const [h, p] = await Promise.all([
        estudiantesService.historial(estSel),
        notasService.promedioEstudiante(estSel),
      ])
      setHistorial(h); setPromedios(p)
    } catch { toast.error('Error cargando historial') }
    finally { setLoading(false) }
  }

  const est = estudiantes.find(e => e.id === estSel)
  const chartData = promedios.map((p: unknown) => {
    const item = p as { curso?: { nombre?: string }; promedio?: number }
    return { nombre: item.curso?.nombre ?? '', promedio: item.promedio ?? 0 }
  })

  return (
    <div className="space-y-4">
      <PageHeader title="Historial Académico" subtitle="Consulta el historial completo de un estudiante" />

      <div className="card !p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-64">
          <label className="label">Estudiante</label>
          <select value={estSel} onChange={e => setEstSel(e.target.value)} className="input">
            <option value="">Seleccionar estudiante...</option>
            {estudiantes.map(e => <option key={e.id} value={e.id}>{e.nombreCompleto} — {e.codigo}</option>)}
          </select>
        </div>
        <button onClick={buscar} disabled={loading} className="btn-primary py-2.5 px-6">
          <Search size={15}/> {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {est && historial.length >= 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Student info */}
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                {est.nombreCompleto.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{est.nombreCompleto}</h3>
                <p className="text-sm text-gray-400">{est.codigo} · {est.grado} Sección {est.seccion}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Evolución del Rendimiento</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="promedio" stroke="#0891b2" strokeWidth={3} dot={{ r: 5, fill: '#0891b2' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Timeline */}
          {historial.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">Sin historial académico registrado</div>
          ) : (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Historial por Periodo</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
                {(historial as unknown[]).map((h, i) => {
                  const item = h as { periodo?: { nombre?: string; cicloEscolar?: string }; curso?: { nombre?: string }; promedio?: number; estado?: string; notas?: unknown[] }
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="relative pl-12 pb-6">
                      <div className="absolute left-3.5 top-1 w-3 h-3 rounded-full bg-accent-500 border-2 border-white dark:border-slate-800 shadow" />
                      <div className="card !p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{item.curso?.nombre}</p>
                            <p className="text-xs text-gray-400">{item.periodo?.nombre} · {item.periodo?.cicloEscolar}</p>
                          </div>
                          <GradeStatusBadge estado={item.estado ?? 'REPROBADO'} promedio={item.promedio ?? 0} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          {(item.notas ?? []).map((n: unknown, j: number) => {
                            const nota = n as { actividad?: { nombre?: string; ponderacion?: number }; valor?: number }
                            return (
                              <div key={j} className="text-xs bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                                <p className="text-gray-400 truncate">{nota.actividad?.nombre}</p>
                                <p className="font-bold text-gray-700 dark:text-gray-200">{nota.valor ?? '—'}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
