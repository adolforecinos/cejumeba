import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Phone, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import GradeStatusBadge from '../../components/common/GradeStatusBadge'
import { estudiantesService } from '../../services/estudiantes.service'
import { notasService } from '../../services/index'
import type { Estudiante, HistorialItem } from '../../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EstudianteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null)
  const [historial,  setHistorial]  = useState<HistorialItem[]>([])
  const [promedios,  setPromedios]  = useState<unknown[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      estudiantesService.obtener(id),
      estudiantesService.historial(id),
      notasService.promedioEstudiante(id),
    ]).then(([e, h, p]) => {
      setEstudiante(e); setHistorial(h); setPromedios(p)
    }).catch(() => toast.error('Error cargando datos'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="card animate-pulse h-96" />
  if (!estudiante) return <div className="text-center p-12 text-gray-400">Estudiante no encontrado</div>

  const chartData = promedios.map((p: unknown) => {
    const item = p as { curso?: { nombre?: string }; promedio?: number }
    return { nombre: item.curso?.nombre ?? '', promedio: item.promedio ?? 0 }
  })

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {estudiante.nombreCompleto.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{estudiante.nombreCompleto}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{estudiante.codigo}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <BookOpen size={14} /> {estudiante.grado} · Sección {estudiante.seccion}
              </div>
              {estudiante.telefono && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={14} /> {estudiante.telefono}
                </div>
              )}
              {estudiante.encargado && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <User size={14} /> {estudiante.encargado}
                </div>
              )}
            </div>
            {estudiante.observaciones && (
              <p className="mt-2 text-xs text-gray-400 italic">{estudiante.observaciones}</p>
            )}
          </div>
          <span className={`badge ${estudiante.estado === 'ACTIVO' ? 'badge-success' : estudiante.estado === 'EGRESADO' ? 'badge-info' : 'badge-danger'}`}>
            {estudiante.estado}
          </span>
        </div>
      </motion.div>

      {/* Performance chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Rendimiento por Curso</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              <Line type="monotone" dataKey="promedio" stroke="#0891b2" strokeWidth={2}
                dot={{ fill: '#0891b2', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Academic history */}
      {historial.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Historial Académico</h3>
          <div className="space-y-4">
            {historial.map((h, i) => (
              <div key={i} className="border border-gray-100 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{h.curso.nombre}</p>
                    <p className="text-xs text-gray-400">{h.periodo.nombre} · {h.periodo.cicloEscolar}</p>
                  </div>
                  <GradeStatusBadge estado={h.estado} promedio={h.promedio} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {h.notas.map((n: unknown, j: number) => {
                    const nota = n as { actividad?: { nombre?: string; ponderacion?: number }; valor?: number }
                    return (
                      <div key={j} className="text-xs bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-gray-500 dark:text-gray-400 truncate">{nota.actividad?.nombre}</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{nota.valor}<span className="text-gray-400 font-normal text-[10px]">/{nota.actividad?.ponderacion}%</span></p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
