import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import PageHeader    from '../../components/common/PageHeader'
import Modal         from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { actividadesService, periodosService, cursosService } from '../../services/index'
import type { ActividadEvaluativa, Curso, PeriodoAcademico } from '../../types'

const schema = z.object({
  nombre:      z.string().min(2, 'Requerido'),
  tipo:        z.enum(['TAREA','EXAMEN','PROYECTO','LABORATORIO','PARTICIPACION']),
  ponderacion: z.number().min(1).max(100),
  cursoId:     z.string().min(1, 'Requerido'),
  periodoId:   z.string().min(1, 'Requerido'),
  fecha:       z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
})
type Form = z.infer<typeof schema>

const TIPOS = ['TAREA','EXAMEN','PROYECTO','LABORATORIO','PARTICIPACION']
const tipoColor: Record<string, string> = {
  TAREA: 'badge-info', EXAMEN: 'badge-danger', PROYECTO: 'badge-success',
  LABORATORIO: 'badge-warning', PARTICIPACION: 'badge-gray',
}

export default function ActividadesPage() {
  const [actividades, setActividades] = useState<ActividadEvaluativa[]>([])
  const [cursos,      setCursos]      = useState<Curso[]>([])
  const [periodos,    setPeriodos]    = useState<PeriodoAcademico[]>([])
  const [cursoFiltro, setCursoFiltro] = useState('')
  const [modal,       setModal]       = useState(false)
  const [editing,     setEditing]     = useState<ActividadEvaluativa | null>(null)
  const [confirm,     setConfirm]     = useState<ActividadEvaluativa | null>(null)
  const [loading,     setLoading]     = useState(true)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'TAREA', ponderacion: 20 },
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> | undefined = cursoFiltro ? { cursoId: cursoFiltro } : undefined
      const [a, c, p] = await Promise.all([
        actividadesService.listar(params), cursosService.listar(), periodosService.listar(),
      ])
      setActividades(a); setCursos(c); setPeriodos(p)
    } catch { toast.error('Error cargando datos') }
    finally { setLoading(false) }
  }, [cursoFiltro])

  useEffect(() => { load() }, [load])

  // Calcular ponderación usada para el curso/periodo seleccionado
  const watchCursoId   = watch('cursoId')
  const watchPeriodoId = watch('periodoId')
  const ponderacionUsada = actividades
    .filter(a => a.cursoId === watchCursoId && a.periodoId === watchPeriodoId && a.id !== editing?.id)
    .reduce((s, a) => s + a.ponderacion, 0)

  const openCreate = () => { setEditing(null); reset({ tipo: 'TAREA', ponderacion: 20 }); setModal(true) }
  const openEdit   = (a: ActividadEvaluativa) => {
    setEditing(a)
    reset({ nombre: a.nombre, tipo: a.tipo, ponderacion: a.ponderacion, cursoId: a.cursoId,
            periodoId: a.periodoId, fecha: a.fecha?.slice(0,10), descripcion: a.descripcion ?? '' })
    setModal(true)
  }

  const onSubmit = async (data: Form) => {
    try {
      if (editing) { await actividadesService.actualizar(editing.id, data); toast.success('Actividad actualizada') }
      else         { await actividadesService.crear(data); toast.success('Actividad creada') }
      setModal(false); load()
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al guardar')
    }
  }

  const handleEliminar = async () => {
    if (!confirm) return
    try { await actividadesService.eliminar(confirm.id); toast.success('Actividad eliminada'); setConfirm(null); load() }
    catch (e: unknown) { toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al eliminar') }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Actividades Evaluativas" subtitle={`${actividades.length} actividades registradas`}
        actions={<button onClick={openCreate} className="btn-primary"><Plus size={16}/> Nueva Actividad</button>}
      />

      {/* Course filter */}
      <div className="flex items-center gap-3">
        <select className="input !w-auto" value={cursoFiltro} onChange={e => setCursoFiltro(e.target.value)}>
          <option value="">Todos los cursos</option>
          {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.grado} {c.seccion}</option>)}
        </select>
      </div>

      {/* Activities grid */}
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-slate-700 animate-pulse" />)}</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {actividades.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className={tipoColor[a.tipo] ?? 'badge-gray'}>{a.tipo}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors"><Edit2 size={13}/></button>
                  <button onClick={() => setConfirm(a)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"><Trash2 size={13}/></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mt-2">{a.nombre}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{(a.curso as { nombre?: string })?.nombre}</p>
              {a.descripcion && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.descripcion}</p>}
              <div className="mt-3 flex items-center justify-between">
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mr-2">
                  <div className="h-2 rounded-full bg-accent-500" style={{ width: `${a.ponderacion}%` }} />
                </div>
                <span className="text-xs font-bold text-accent-600 dark:text-accent-400 whitespace-nowrap">{a.ponderacion}%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{new Date(a.fecha).toLocaleDateString('es-GT')}</p>
            </motion.div>
          ))}
          {actividades.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <AlertCircle size={32} className="mx-auto mb-2" />
              <p>No hay actividades registradas</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Actividad' : 'Nueva Actividad'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">Nombre de la Actividad *</label>
            <input {...register('nombre')} className={`input ${errors.nombre ? 'input-error' : ''}`} placeholder="Ej: Examen de Fracciones" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo *</label>
              <select {...register('tipo')} className="input">
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fecha *</label>
              <input type="date" {...register('fecha')} className={`input ${errors.fecha ? 'input-error' : ''}`} />
            </div>
          </div>
          <div>
            <label className="label">Curso *</label>
            <select {...register('cursoId')} className={`input ${errors.cursoId ? 'input-error' : ''}`}>
              <option value="">Seleccionar curso</option>
              {cursos.filter(c => c.estado === 'ACTIVO').map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.grado} {c.seccion}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Periodo *</label>
            <select {...register('periodoId')} className={`input ${errors.periodoId ? 'input-error' : ''}`}>
              <option value="">Seleccionar periodo</option>
              {periodos.filter(p => p.estado === 'ABIERTO').map(p => <option key={p.id} value={p.id}>{p.nombre} {p.cicloEscolar}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ponderación % * (Usada: {ponderacionUsada}% / Disponible: {100 - ponderacionUsada}%)</label>
            <input type="number" {...register('ponderacion', { valueAsNumber: true })} className={`input ${errors.ponderacion ? 'input-error' : ''}`} min={1} max={100-ponderacionUsada} />
            {/* Visual bar */}
            <div className="mt-2 bg-gray-100 dark:bg-slate-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-accent-500 transition-all" style={{ width: `${Math.min(ponderacionUsada,100)}%` }} />
            </div>
            {errors.ponderacion && <p className="text-red-500 text-xs mt-1">{errors.ponderacion.message}</p>}
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea {...register('descripcion')} className="input min-h-[60px] resize-none" placeholder="Descripción opcional..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} title="Eliminar Actividad"
        message={`¿Eliminar la actividad "${confirm?.nombre}"? También se eliminarán las notas asociadas.`}
        onConfirm={handleEliminar} onCancel={() => setConfirm(null)} confirmLabel="Eliminar" />
    </div>
  )
}
