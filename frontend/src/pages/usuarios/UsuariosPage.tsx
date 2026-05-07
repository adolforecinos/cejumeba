import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import PageHeader    from '../../components/common/PageHeader'
import DataTable     from '../../components/common/DataTable'
import Modal         from '../../components/common/Modal'
import { usuariosService } from '../../services/index'
import type { Usuario } from '../../types'

const schema = z.object({
  nombre:   z.string().min(3,'Mínimo 3 caracteres'),
  correo:   z.string().email('Correo inválido'),
  password: z.string().min(6,'Mínimo 6 caracteres').optional().or(z.literal('')),
  rol:      z.enum(['ADMINISTRADOR','DIRECTOR','DOCENTE','SECRETARIA']),
})
type Form = z.infer<typeof schema>

const rolColor: Record<string, string> = {
  ADMINISTRADOR: 'badge-danger', DIRECTOR: 'badge-info',
  DOCENTE: 'bg-blue-100 text-blue-700 badge', SECRETARIA: 'badge-success',
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<Usuario | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const load = useCallback(async () => {
    setLoading(true)
    try { setUsuarios(await usuariosService.listar()) }
    catch { toast.error('Error cargando usuarios') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); reset({ rol: 'DOCENTE' }); setModal(true) }
  const openEdit   = (u: Usuario) => {
    setEditing(u)
    reset({ nombre: u.nombre, correo: u.correo, rol: u.rol, password: '' })
    setModal(true)
  }

  const onSubmit = async (data: Form) => {
    if (!editing && !data.password) {
      toast.error('La contraseña es requerida')
      return
    }
    const payload: Partial<Usuario> & { password?: string } = { nombre: data.nombre, correo: data.correo, rol: data.rol }
    if (data.password) payload.password = data.password
    try {
      if (editing) { await usuariosService.actualizar(editing.id, payload); toast.success('Usuario actualizado') }
      else         { await usuariosService.crear(payload as Partial<Usuario> & { password: string }); toast.success('Usuario creado') }
      setModal(false); load()
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al guardar')
    }
  }

  const toggleEstado = async (u: Usuario) => {
    const nuevo = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    try { await usuariosService.cambiarEstado(u.id, nuevo); toast.success(`Usuario ${nuevo === 'ACTIVO' ? 'activado' : 'desactivado'}`); load() }
    catch { toast.error('Error al cambiar estado') }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Gestión de Usuarios" subtitle={`${usuarios.length} usuarios en el sistema`}
        actions={<button onClick={openCreate} className="btn-primary"><Plus size={16}/> Nuevo Usuario</button>}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card !p-0 overflow-hidden">
        {loading ? <div className="p-8 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse"/>)}</div> : (
          <div className="p-4">
            <DataTable
              data={usuarios as unknown as Record<string, unknown>[]}
              searchKeys={['nombre','correo'] as never[]}
              searchPlaceholder="Buscar usuarios..."
              columns={[
                { key: 'nombre', label: 'Nombre' },
                { key: 'correo', label: 'Correo' },
                { key: 'rol',    label: 'Rol', render: r => <span className={rolColor[r.rol as string] ?? 'badge-gray'}>{r.rol as string}</span> },
                { key: 'estado', label: 'Estado', render: r => <span className={r.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}>{r.estado as string}</span> },
                { key: 'ultimoAcceso', label: 'Último Acceso', render: r => r.ultimoAcceso ? new Date(r.ultimoAcceso as string).toLocaleDateString('es-GT') : '—' },
              ]}
              actions={row => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(row as unknown as Usuario)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors"><Edit2 size={15}/></button>
                  <button onClick={() => toggleEstado(row as unknown as Usuario)} title="Cambiar estado"
                    className={`p-1.5 rounded-lg transition-colors ${row.estado === 'ACTIVO' ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500'}`}>
                    {row.estado === 'ACTIVO' ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </motion.div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">Nombre Completo *</label>
            <input {...register('nombre')} className={`input ${errors.nombre ? 'input-error' : ''}`} placeholder="Nombre del usuario" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="label">Correo Electrónico *</label>
            <input {...register('correo')} type="email" className={`input ${errors.correo ? 'input-error' : ''}`} placeholder="usuario@cejumeva.edu.gt" disabled={!!editing} />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
          </div>
          <div>
            <label className="label">{editing ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
            <input {...register('password')} type="password" className={`input ${errors.password ? 'input-error' : ''}`} placeholder={editing ? '••••••• (opcional)' : 'Mínimo 6 caracteres'} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Rol *</label>
            <select {...register('rol')} className="input">
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="DIRECTOR">Director</option>
              <option value="DOCENTE">Docente</option>
              <option value="SECRETARIA">Secretaria</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
