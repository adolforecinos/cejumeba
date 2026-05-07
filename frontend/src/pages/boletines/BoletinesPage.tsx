import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Printer, Search, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import GradeStatusBadge from '../../components/common/GradeStatusBadge'
import { boletinesService, periodosService } from '../../services/index'
import { estudiantesService } from '../../services/estudiantes.service'
import type { Boletin, Estudiante, PeriodoAcademico } from '../../types'

export default function BoletinesPage() {
  const [estudiantes,  setEstudiantes]  = useState<Estudiante[]>([])
  const [periodos,     setPeriodos]     = useState<PeriodoAcademico[]>([])
  const [estSel,       setEstSel]       = useState('')
  const [perSel,       setPerSel]       = useState('')
  const [boletin,      setBoletin]      = useState<Boletin | null>(null)
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    Promise.all([estudiantesService.listar(), periodosService.listar()])
      .then(([e, p]) => { setEstudiantes(e); setPeriodos(p) })
      .catch(() => toast.error('Error cargando datos'))
  }, [])

  const generar = async () => {
    if (!estSel || !perSel) { toast.error('Selecciona estudiante y periodo'); return }
    setLoading(true); setBoletin(null)
    try {
      setBoletin(await boletinesService.generar(estSel, perSel))
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al generar boletín')
    } finally { setLoading(false) }
  }

  const imprimir = () => window.print()

  return (
    <div className="space-y-4">
      <PageHeader title="Boletines Académicos" subtitle="Genera y consulta boletines de calificaciones" />

      {/* Selectors */}
      <div className="card !p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="label">Estudiante</label>
          <select value={estSel} onChange={e => setEstSel(e.target.value)} className="input">
            <option value="">Seleccionar estudiante...</option>
            {estudiantes.filter(e => e.estado === 'ACTIVO').map(e => (
              <option key={e.id} value={e.id}>{e.nombreCompleto} — {e.codigo}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="label">Periodo</label>
          <select value={perSel} onChange={e => setPerSel(e.target.value)} className="input">
            <option value="">Seleccionar periodo...</option>
            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.cicloEscolar}</option>)}
          </select>
        </div>
        <button onClick={generar} disabled={loading} className="btn-primary py-2.5 px-6">
          {loading ? 'Generando...' : <><Search size={15}/> Generar Boletín</>}
        </button>
      </div>

      {/* Boletin */}
      {boletin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card print:shadow-none" id="boletin-print">
          {/* Header */}
          <div className="text-center border-b border-gray-200 dark:border-slate-700 pb-5 mb-5">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center mb-3">
              <FileText size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-primary-900 dark:text-gray-100">INSTITUTO CEJUMEVA</h2>
            <p className="text-sm text-gray-500">Boletín de Calificaciones</p>
            <p className="text-sm font-semibold text-accent-600 mt-1">{boletin.periodo.nombre} — {boletin.periodo.cicloEscolar}</p>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-gray-50 dark:bg-slate-700/40 rounded-xl p-4">
            <div><p className="text-xs text-gray-400">Estudiante</p><p className="font-semibold text-sm">{boletin.estudiante.nombreCompleto}</p></div>
            <div><p className="text-xs text-gray-400">Código</p><p className="font-semibold text-sm">{boletin.estudiante.codigo}</p></div>
            <div><p className="text-xs text-gray-400">Grado</p><p className="font-semibold text-sm">{boletin.estudiante.grado}</p></div>
            <div><p className="text-xs text-gray-400">Sección</p><p className="font-semibold text-sm">{boletin.estudiante.seccion}</p></div>
          </div>

          {/* Cursos */}
          {boletin.cursos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Sin cursos matriculados en este periodo</p>
          ) : boletin.cursos.map((c, i) => (
            <div key={i} className="mb-4 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 flex justify-between items-center">
                <p className="font-semibold text-primary-800 dark:text-primary-300 text-sm">{c.curso.nombre}</p>
                <GradeStatusBadge estado={c.estado} promedio={c.promedio} />
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700/30">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Actividad</th>
                    <th className="px-4 py-2 text-center text-xs text-gray-500">Tipo</th>
                    <th className="px-4 py-2 text-center text-xs text-gray-500">Pond.</th>
                    <th className="px-4 py-2 text-center text-xs text-gray-500">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {c.actividades.map((a, j) => (
                    <tr key={j} className="border-t border-gray-50 dark:border-slate-700/30">
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{a.nombre}</td>
                      <td className="px-4 py-2 text-center text-xs text-gray-400">{a.tipo}</td>
                      <td className="px-4 py-2 text-center text-xs text-gray-400">{a.ponderacion}%</td>
                      <td className="px-4 py-2 text-center font-bold">{a.nota !== null ? a.nota : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-4 flex items-center justify-between bg-primary-900 dark:bg-primary-800 rounded-xl p-4 text-white">
            <div>
              <p className="text-primary-300 text-xs">Promedio General del Periodo</p>
              <p className="text-3xl font-bold">{boletin.promedioGeneral.toFixed(1)}</p>
            </div>
            <GradeStatusBadge estado={boletin.estadoGeneral} />
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={imprimir} className="btn-accent">
              <Printer size={16} /> Imprimir / Exportar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
