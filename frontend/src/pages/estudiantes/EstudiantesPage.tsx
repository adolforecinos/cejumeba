import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit2, UserX, Filter } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import PageHeader    from '../../components/common/PageHeader'
import DataTable     from '../../components/common/DataTable'
import Modal         from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { estudiantesService } from '../../services/estudiantes.service'
import { useAuthStore } from '../../store/auth.store'
import type { Estudiante } from '../../types'

const schema = z.object({
  codigo:         z.string().min(1, 'Requerido'),
  nombreCompleto: z.string().min(3, 'Mínimo 3 caracteres'),
  grado:          z.string().min(1, 'Requerido'),
  seccion:        z.string().min(1, 'Requerido'),
  encargado:      z.string().optional(),
  telefono:       z.string().optional(),
  observaciones:  z.string().optional(),
  estado:         z.enum(['ACTIVO','INACTIVO','EGRESADO']),
})
type Form = z.infer<typeof schema>

const GRADOS = ['1ro Primaria','2do Primaria','3ro Primaria','4to Primaria','5to Primaria','6to Primaria',
                '1ro Básico','2do Básico','3ro Básico']

export default function EstudiantesPage() {
  const navigate  = useNavigate()
  const { user } = useAuthStore()
  const canManage = user?.rol === 'SECRETARIA'
  const [data,    setData]    = useState<Estudiante[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState<Estudiante | null>(null)
  const [confirm, setConfirm] = useState<Estudiante | null>(null)
  const [deleting,setDeleting]= useState(false)
  const [filter,  setFilter]  = useState<Record<string,string>>({})

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { estado: 'ACTIVO' },
  })

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await estudiantesService.listar(filter)) }
    catch { toast.error('Error cargando estudiantes') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); reset({ estado: 'ACTIVO' }); setModal(true) }
  const openEdit   = (e: Estudiante) => {
    setEditing(e)
    reset({ codigo: e.codigo, nombreCompleto: e.nombreCompleto, grado: e.grado, seccion: e.seccion,
            encargado: e.encargado ?? '', telefono: e.telefono ?? '', observaciones: e.observaciones ?? '', estado: e.estado })
    setModal(true)
  }

  const onSubmit = async (data: Form) => {
    try {
      if (editing) {
        await estudiantesService.actualizar(editing.id, data)
        toast.success('Estudiante actualizado')
      } else {
        await estudiantesService.crear(data)
        toast.success('Estudiante creado')
      }
      setModal(false); load()
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al guardar')
    }
  }

  const handleBaja = async () => {
    if (!confirm) return
    setDeleting(true)
    try {
      await estudiantesService.baja(confirm.id)
      toast.success('Baja registrada')
      setConfirm(null); load()
    } catch { toast.error('Error al dar de baja') }
    finally { setDeleting(false) }
  }

  const estadoBadge = (estado: string) => {
    const c = { ACTIVO: 'badge-success', INACTIVO: 'badge-danger', EGRESADO: 'badge-gray' }[estado] ?? 'badge-gray'
    return <span className={c}>{estado}</span>
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Gestión de Estudiantes" subtitle={`${data.length} estudiantes registrados`}
        actions={canManage ? (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Nuevo Estudiante
          </button>
        ) : undefined}
      />

      {/* Filters */}
      <div className="card !p-4 flex flex-wrap gap-3">
        <Filter size={16} className="text-gray-400 mt-2.5" />
        <select className="input !w-auto" onChange={e => setFilter(f => ({ ...f, grado: e.target.value }))}>
          <option value="">Todos los grados</option>
          {GRADOS.map(g => <option key={g}>{g}</option>)}
        </select>
        <select className="input !w-auto" onChange={e => setFilter(f => ({ ...f, seccion: e.target.value }))}>
          <option value="">Todas las secciones</option>
          {['A','B','C'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input !w-auto" onChange={e => setFilter(f => ({ ...f, estado: e.target.value }))}>
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
          <option value="EGRESADO">Egresados</option>
        </select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />)}
          </div>
        ) : (
          <div className="p-4">
            <DataTable
              data={data as unknown as Record<string, unknown>[]}
              searchKeys={['nombreCompleto', 'codigo'] as never[]}
              searchPlaceholder="Buscar por nombre o código..."
              columns={[
                { key: 'codigo',         label: 'Código' },
                { key: 'nombreCompleto', label: 'Nombre Completo' },
                { key: 'grado',          label: 'Grado' },
                { key: 'seccion',        label: 'Sección' },
                { key: 'estado',         label: 'Estado', render: (r) => estadoBadge(r.estado as string) },
              ]}
              actions={row => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => navigate(`/estudiantes/${row.id}`)} title="Ver perfil"
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors">
                    <Eye size={15} />
                  </button>
                  {canManage && <button onClick={() => openEdit(row as unknown as Estudiante)} title="Editar"
                    className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors">
                    <Edit2 size={15} />
                  </button>}
                  {canManage && (row.estado as string) === 'ACTIVO' && (
                    <button onClick={() => setConfirm(row as unknown as Estudiante)} title="Dar de baja"
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                      <UserX size={15} />
                    </button>
                  )}
                </div>
              )}
              emptyMessage="No se encontraron estudiantes"
            />
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Estudiante' : 'Nuevo Estudiante'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Código *</label>
              <input {...register('codigo')} className={`input ${errors.codigo ? 'input-error' : ''}`} placeholder="EST-001" disabled={!!editing} />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo.message}</p>}
            </div>
            <div>
              <label className="label">Estado</label>
              <select {...register('estado')} className="input">
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="EGRESADO">Egresado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Nombre Completo *</label>
            <input {...register('nombreCompleto')} className={`input ${errors.nombreCompleto ? 'input-error' : ''}`} placeholder="Nombre completo del estudiante" />
            {errors.nombreCompleto && <p className="text-red-500 text-xs mt-1">{errors.nombreCompleto.message}</p>}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Encargado</label>
              <input {...register('encargado')} className="input" placeholder="Nombre del encargado" />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input {...register('telefono')} className="input" placeholder="5555-0000" />
            </div>
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea {...register('observaciones')} className="input min-h-[60px] resize-none" placeholder="Observaciones adicionales..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Estudiante'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} message={`¿Dar de baja al estudiante ${confirm?.nombreCompleto}?`}
        onConfirm={handleBaja} onCancel={() => setConfirm(null)} loading={deleting}
        confirmLabel="Dar de Baja" title="Confirmar Baja" />
    </div>
  )
}
