import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import GradeStatusBadge from '../../components/common/GradeStatusBadge'
import { cursosService } from '../../services/cursos.service'
import { actividadesService, notasService } from '../../services/index'
import type { Curso, ActividadEvaluativa, Estudiante } from '../../types'

export default function NotasPage() {
  const [cursos,      setCursos]      = useState<Curso[]>([])
  const [actividades, setActividades] = useState<ActividadEvaluativa[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [cursoSel,    setCursoSel]    = useState('')
  const [actSel,      setActSel]      = useState('')
  const [notas,       setNotas]       = useState<Record<string, number>>({})
  const [notasGuardadas, setNotasGuardadas] = useState<Record<string, number>>({})
  const [saving,      setSaving]      = useState(false)

  useEffect(() => { cursosService.listar().then(setCursos).catch(() => {}) }, [])

  useEffect(() => {
    if (!cursoSel) { setActividades([]); setEstudiantes([]); setActSel(''); return }
    Promise.all([
      actividadesService.listar({ cursoId: cursoSel }),
      cursosService.estudiantes(cursoSel),
    ]).then(([a, e]) => { setActividades(a); setEstudiantes(e); setActSel(''); setNotas({}) })
      .catch(() => toast.error('Error cargando datos del curso'))
  }, [cursoSel])

  useEffect(() => {
    if (!actSel) { setNotas({}); return }
    notasService.listar({ actividadId: actSel }).then(ns => {
      const map: Record<string, number> = {}
      ns.forEach((n: { estudianteId: string; valor: number }) => { map[n.estudianteId] = n.valor })
      setNotas(map); setNotasGuardadas(map)
    }).catch(() => {})
  }, [actSel])

  const handleSave = async () => {
    if (!actSel) { toast.error('Selecciona una actividad'); return }
    const payload = estudiantes.map(e => ({ estudianteId: e.id, actividadId: actSel, valor: notas[e.id] ?? 0 }))
    setSaving(true)
    try {
      await notasService.guardarBulk(payload)
      setNotasGuardadas({ ...notas })
      toast.success('Notas guardadas exitosamente')
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al guardar notas')
    } finally { setSaving(false) }
  }

  const getEstado = (val: number) => val >= 70 ? 'APROBADO' : val >= 60 ? 'EN_RIESGO' : 'REPROBADO'
  const actividad = actividades.find(a => a.id === actSel)
  const hayCambios = JSON.stringify(notas) !== JSON.stringify(notasGuardadas)

  return (
    <div className="space-y-4">
      <PageHeader title="Registro de Notas" subtitle="Ingresa y edita calificaciones por actividad" />

      {/* Selectors */}
      <div className="card !p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Curso</label>
          <div className="relative">
            <select value={cursoSel} onChange={e => setCursoSel(e.target.value)} className="input pr-9 appearance-none">
              <option value="">Seleccionar curso...</option>
              {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.grado} {c.seccion}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="label">Actividad Evaluativa</label>
          <div className="relative">
            <select value={actSel} onChange={e => setActSel(e.target.value)} disabled={!cursoSel} className="input pr-9 appearance-none disabled:opacity-50">
              <option value="">Seleccionar actividad...</option>
              {actividades.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) · {a.ponderacion}%</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Notes grid */}
      {actSel && estudiantes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{actividad?.nombre}</h3>
              <p className="text-xs text-gray-400">Ponderación: {actividad?.ponderacion}% · {estudiantes.length} estudiantes</p>
            </div>
            {hayCambios && (
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar Notas'}
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Estudiante</th>
                  <th>Nota (0–100)</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((e, i) => {
                  const val = notas[e.id] ?? 0
                  return (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <td className="text-gray-400 text-xs">{i + 1}</td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{e.nombreCompleto}</p>
                          <p className="text-xs text-gray-400">{e.codigo}</p>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number" min={0} max={100} value={notas[e.id] ?? ''}
                          onChange={ev => {
                            const v = Math.min(100, Math.max(0, Number(ev.target.value)))
                            setNotas(prev => ({ ...prev, [e.id]: v }))
                          }}
                          placeholder="0"
                          className={`input !w-24 text-center font-bold text-base
                            ${val >= 70 ? 'border-emerald-300 focus:ring-emerald-400' :
                              val >= 60 ? 'border-amber-300 focus:ring-amber-400' :
                              val > 0   ? 'border-red-300 focus:ring-red-400' : ''}`}
                        />
                      </td>
                      <td>
                        {val > 0 ? <GradeStatusBadge estado={getEstado(val)} promedio={val} size="sm" /> : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {hayCambios && (
            <div className="mt-4 flex justify-end">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <Save size={15} /> {saving ? 'Guardando...' : 'Guardar Notas'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {cursoSel && !actSel && (
        <div className="card text-center py-12 text-gray-400">
          <p>Selecciona una actividad para ver y editar notas</p>
        </div>
      )}
      {!cursoSel && (
        <div className="card text-center py-12 text-gray-400">
          <p>Selecciona un curso para comenzar</p>
        </div>
      )}
    </div>
  )
}
