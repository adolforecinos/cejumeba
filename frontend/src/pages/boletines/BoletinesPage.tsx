import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Printer, Search, FileText, Files } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import GradeStatusBadge from '../../components/common/GradeStatusBadge'
import { boletinesService, periodosService } from '../../services/index'
import { estudiantesService } from '../../services/estudiantes.service'
import type { Boletin, Estudiante, PeriodoAcademico } from '../../types'

function BoletinDocumento({ boletin }: { boletin: Boletin }) {
  return (
    <section className="boletin-document bg-white text-gray-900 rounded-xl border border-gray-200 p-6 shadow-sm print:shadow-none print:border-0 print:rounded-none">
      <div className="text-center border-b border-gray-200 pb-4 mb-4">
        <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center mb-2 print:hidden">
          <FileText size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-primary-900">INSTITUTO CEJUMEVA</h2>
        <p className="text-sm text-gray-500">Boletín de Calificaciones</p>
        <p className="text-sm font-semibold text-accent-700 mt-1">{boletin.periodo.nombre} - {boletin.periodo.cicloEscolar}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 bg-gray-50 rounded-lg p-3">
        <div><p className="text-xs text-gray-400">Estudiante</p><p className="font-semibold text-sm">{boletin.estudiante.nombreCompleto}</p></div>
        <div><p className="text-xs text-gray-400">Código</p><p className="font-semibold text-sm">{boletin.estudiante.codigo}</p></div>
        <div><p className="text-xs text-gray-400">Grado</p><p className="font-semibold text-sm">{boletin.estudiante.grado}</p></div>
        <div><p className="text-xs text-gray-400">Sección</p><p className="font-semibold text-sm">{boletin.estudiante.seccion}</p></div>
      </div>

      {boletin.cursos.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Sin cursos matriculados en este periodo</p>
      ) : boletin.cursos.map((c, i) => (
        <div key={i} className="mb-4 border border-gray-200 rounded-lg overflow-hidden break-inside-avoid">
          <div className="bg-primary-50 px-4 py-2 flex justify-between items-center">
            <p className="font-semibold text-primary-900 text-sm">{c.curso.nombre}</p>
            <GradeStatusBadge estado={c.estado} promedio={c.promedio} />
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-500">Actividad</th>
                <th className="px-4 py-2 text-center text-xs text-gray-500">Tipo</th>
                <th className="px-4 py-2 text-center text-xs text-gray-500">Pond.</th>
                <th className="px-4 py-2 text-center text-xs text-gray-500">Nota</th>
              </tr>
            </thead>
            <tbody>
              {c.actividades.map((a, j) => (
                <tr key={j} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-700">{a.nombre}</td>
                  <td className="px-4 py-2 text-center text-xs text-gray-500">{a.tipo}</td>
                  <td className="px-4 py-2 text-center text-xs text-gray-500">{a.ponderacion}%</td>
                  <td className="px-4 py-2 text-center font-bold">{a.nota !== null ? a.nota : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="mt-4 flex items-center justify-between bg-primary-900 rounded-lg p-4 text-white">
        <div>
          <p className="text-primary-200 text-xs">Promedio General del Periodo</p>
          <p className="text-3xl font-bold">{boletin.promedioGeneral.toFixed(1)}</p>
        </div>
        <GradeStatusBadge estado={boletin.estadoGeneral} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-10 text-center text-xs text-gray-500 print:block">
        <div className="pt-8 border-t border-gray-300">Firma docente</div>
        <div className="pt-8 border-t border-gray-300">Firma dirección</div>
      </div>
    </section>
  )
}

export default function BoletinesPage() {
  const [estudiantes,  setEstudiantes]  = useState<Estudiante[]>([])
  const [periodos,     setPeriodos]     = useState<PeriodoAcademico[]>([])
  const [estSel,       setEstSel]       = useState('')
  const [perSel,       setPerSel]       = useState('')
  const [boletines,    setBoletines]    = useState<Boletin[]>([])
  const [loading,      setLoading]      = useState(false)
  const [loadingTodos, setLoadingTodos] = useState(false)

  useEffect(() => {
    Promise.all([estudiantesService.listar(), periodosService.listar()])
      .then(([e, p]) => { setEstudiantes(e); setPeriodos(p) })
      .catch(() => toast.error('Error cargando datos'))
  }, [])

  const generar = async () => {
    if (!estSel || !perSel) { toast.error('Selecciona estudiante y periodo'); return }
    setLoading(true); setBoletines([])
    try {
      setBoletines([await boletinesService.generar(estSel, perSel)])
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al generar boletín')
    } finally { setLoading(false) }
  }

  const generarTodos = async () => {
    if (!perSel) { toast.error('Selecciona un periodo'); return }
    const activos = estudiantes.filter(e => e.estado === 'ACTIVO')
    if (activos.length === 0) { toast.error('No hay estudiantes activos'); return }

    setLoadingTodos(true); setBoletines([])
    try {
      const generados = await Promise.all(activos.map(e => boletinesService.generar(e.id, perSel)))
      const imprimibles = generados.filter(b => b.cursos.length > 0)
      setBoletines(imprimibles)
      toast.success(`${imprimibles.length} boletines listos para imprimir`)
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al generar boletines')
    } finally { setLoadingTodos(false) }
  }

  const imprimir = () => {
    if (boletines.length === 0) { toast.error('Genera al menos un boletín'); return }
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="no-print">
        <PageHeader title="Boletines Académicos" subtitle="Genera y consulta boletines de calificaciones" />

        <div className="card !p-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="label">Estudiante</label>
            <select value={estSel} onChange={e => setEstSel(e.target.value)} className="input">
              <option value="">Seleccionar estudiante...</option>
              {estudiantes.filter(e => e.estado === 'ACTIVO').map(e => (
                <option key={e.id} value={e.id}>{e.nombreCompleto} - {e.codigo}</option>
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
          <button onClick={generar} disabled={loading || loadingTodos} className="btn-primary py-2.5 px-6">
            {loading ? 'Generando...' : <><Search size={15}/> Generar Boletín</>}
          </button>
          <button onClick={generarTodos} disabled={loading || loadingTodos} className="btn-outline py-2.5 px-6">
            {loadingTodos ? 'Generando...' : <><Files size={15}/> Generar Todos</>}
          </button>
          <button onClick={imprimir} disabled={boletines.length === 0 || loading || loadingTodos} className="btn-accent py-2.5 px-6">
            <Printer size={16} /> Imprimir
          </button>
        </div>
      </div>

      <div id="boletines-print" className="space-y-6 print:block print:space-y-0">
        {boletines.map((b, i) => (
          <motion.div key={`${b.estudiante.id}-${b.periodo.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={i < boletines.length - 1 ? 'print-page' : ''}>
            <BoletinDocumento boletin={b} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
