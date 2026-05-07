import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import DataTable  from '../../components/common/DataTable'
import Modal      from '../../components/common/Modal'
import { cursosService }   from '../../services/cursos.service'
import { periodosService, usuariosService } from '../../services/index'
import { estudiantesService } from '../../services/estudiantes.service'
import { useAuthStore } from '../../store/auth.store'
import type { Curso, Estudiante, PeriodoAcademico, Usuario } from '../../types'

const schema = z.object({
  codigo:    z.string().min(1, 'Requerido'),
  nombre:    z.string().min(2, 'Requerido'),
  grado:     z.string().min(1, 'Requerido'),
  seccion:   z.string().min(1, 'Requerido'),
  docenteId: z.string().min(1, 'Requerido'),
  periodoId: z.string().min(1, 'Requerido'),
  estado:    z.enum(['ACTIVO','INACTIVO']),
})
type Form = z.infer<typeof schema>

const GRADOS = ['1ro Primaria','2do Primaria','3ro Primaria','4to Primaria','5to Primaria','6to Primaria']

export default function CursosPage() {
  const { user } = useAuthStore()
  const canManage = user?.rol === 'ADMINISTRADOR'
  const [cursos,   setCursos]   = useState<Curso[]>([])
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([])
  const [docentes, setDocentes] = useState<Usuario[]>([])
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<Curso | null>(null)
  const [matriculaCurso, setMatriculaCurso] = useState<Curso | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loadingMatricula, setLoadingMatricula] = useState(false)
  const [savingMatricula, setSavingMatricula] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { estado: 'ACTIVO' },
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, p, u] = await Promise.all([
        cursosService.listar(),
        periodosService.listar(),
        canManage ? usuariosService.listar() : Promise.resolve([] as Usuario[]),
      ])
      setCursos(c)
      setPeriodos(p)
      setDocentes(u.filter(u => u.rol === 'DOCENTE' || u.rol === 'ADMINISTRADOR'))
    } catch { toast.error('Error cargando datos') }
    finally { setLoading(false) }
  }, [canManage])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); reset({ estado: 'ACTIVO' }); setModal(true) }
  const openEdit   = (c: Curso) => {
    setEditing(c)
    reset({ codigo: c.codigo, nombre: c.nombre, grado: c.grado, seccion: c.seccion,
            docenteId: c.docenteId, periodoId: c.periodoId, estado: c.estado })
    setModal(true)
  }

  const onSubmit = async (data: Form) => {
    try {
      if (editing) { await cursosService.actualizar(editing.id, data); toast.success('Curso actualizado') }
      else         { await cursosService.crear(data); toast.success('Curso creado') }
      setModal(false); load()
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al guardar')
    }
  }

  const openMatricula = async (curso: Curso) => {
    setMatriculaCurso(curso)
    setLoadingMatricula(true)
    try {
      const [todos, asignados] = await Promise.all([
        estudiantesService.listar({ estado: 'ACTIVO' }),
        cursosService.estudiantes(curso.id) as Promise<Estudiante[]>,
      ])
      setEstudiantes(todos.filter(e => e.grado === curso.grado && e.seccion === curso.seccion))
      setSelectedIds(asignados.map(e => e.id))
    } catch {
      toast.error('Error cargando matrícula')
    } finally {
      setLoadingMatricula(false)
    }
  }

  const toggleEstudiante = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const saveMatricula = async () => {
    if (!matriculaCurso) return
    setSavingMatricula(true)
    try {
      await cursosService.actualizarEstudiantes(matriculaCurso.id, selectedIds)
      toast.success('Matrícula actualizada')
      setMatriculaCurso(null)
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error actualizando matrícula')
    } finally {
      setSavingMatricula(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Gestión de Cursos" subtitle={`${cursos.length} cursos registrados`}
        actions={canManage ? <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Nuevo Curso</button> : undefined}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card !p-0 overflow-hidden">
        {loading ? <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />)}</div> : (
          <div className="p-4">
            <DataTable
              data={cursos as unknown as Record<string, unknown>[]}
              searchKeys={['nombre','codigo'] as never[]}
              searchPlaceholder="Buscar cursos..."
              columns={[
                { key: 'codigo',  label: 'Código' },
                { key: 'nombre',  label: 'Nombre' },
                { key: 'grado',   label: 'Grado' },
                { key: 'seccion', label: 'Sección' },
                { key: 'docente', label: 'Docente',  render: r => (r.docente as { nombre?: string })?.nombre ?? '-' },
                { key: 'estado',  label: 'Estado',   render: r => <span className={r.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}>{r.estado as string}</span> },
              ]}
              actions={row => (
                <div className="flex items-center justify-end gap-1">
                  {canManage && <button onClick={() => openMatricula(row as unknown as Curso)} title="Asignar estudiantes" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"><Users size={15} /></button>}
                  {canManage && <button onClick={() => openEdit(row as unknown as Curso)} title="Editar" className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors"><Edit2 size={15} /></button>}
                </div>
              )}
            />
          </div>
        )}
      </motion.div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Curso' : 'Nuevo Curso'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Código *</label>
              <input {...register('codigo')} className={`input ${errors.codigo ? 'input-error' : ''}`} placeholder="MAT-3A-2024" disabled={!!editing} />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo.message}</p>}
            </div>
            <div>
              <label className="label">Estado</label>
              <select {...register('estado')} className="input">
                <option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Nombre del Curso *</label>
            <input {...register('nombre')} className={`input ${errors.nombre ? 'input-error' : ''}`} placeholder="Ej: Matemáticas" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Grado *</label>
              <select {...register('grado')} className={`input ${errors.grado ? 'input-error' : ''}`}>
                <option value="">Seleccionar</option>
                {GRADOS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sección *</label>
              <select {...register('seccion')} className={`input ${errors.seccion ? 'input-error' : ''}`}>
                <option value="">Seleccionar</option>
                {['A','B','C'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Docente Asignado *</label>
            <select {...register('docenteId')} className={`input ${errors.docenteId ? 'input-error' : ''}`}>
              <option value="">Seleccionar docente</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Periodo Académico *</label>
            <select {...register('periodoId')} className={`input ${errors.periodoId ? 'input-error' : ''}`}>
              <option value="">Seleccionar periodo</option>
              {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.cicloEscolar} · {p.estado}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!matriculaCurso} onClose={() => setMatriculaCurso(null)} title={`Matrícula: ${matriculaCurso?.nombre ?? ''}`} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 p-3 text-sm text-primary-800 dark:text-primary-200">
            {matriculaCurso?.grado} sección {matriculaCurso?.seccion} · {selectedIds.length} estudiantes seleccionados
          </div>

          {loadingMatricula ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />)}</div>
          ) : estudiantes.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No hay estudiantes activos para este grado y sección</div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {estudiantes.map(e => (
                <label key={e.id} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-slate-700 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/40 cursor-pointer">
                  <input type="checkbox" checked={selectedIds.includes(e.id)} onChange={() => toggleEstudiante(e.id)} className="h-4 w-4 accent-cyan-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{e.nombreCompleto}</p>
                    <p className="text-xs text-gray-400">{e.codigo}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setMatriculaCurso(null)} className="btn-ghost flex-1">Cancelar</button>
            <button type="button" onClick={saveMatricula} disabled={savingMatricula || loadingMatricula} className="btn-primary flex-1 justify-center">
              {savingMatricula ? 'Guardando...' : 'Guardar Matrícula'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
