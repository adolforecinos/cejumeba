import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Unlock, Lock, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import PageHeader    from '../../components/common/PageHeader'
import Modal         from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { periodosService } from '../../services/index'
import { useAuthStore } from '../../store/auth.store'
import type { PeriodoAcademico } from '../../types'

const schema = z.object({
  nombre:       z.string().min(2,'Requerido'),
  cicloEscolar: z.string().min(4,'Requerido'),
  fechaInicio:  z.string().min(1,'Requerido'),
  fechaCierre:  z.string().min(1,'Requerido'),
})
type Form = z.infer<typeof schema>

export default function PeriodosPage() {
  const { user } = useAuthStore()
  const canManage = user?.rol === 'DIRECTOR'
  const [periodos,  setPeriodos]  = useState<PeriodoAcademico[]>([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [editing,   setEditing]   = useState<PeriodoAcademico | null>(null)
  const [closeItem, setCloseItem] = useState<PeriodoAcademico | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const load = useCallback(async () => {
    setLoading(true)
    try { setPeriodos(await periodosService.listar()) }
    catch { toast.error('Error cargando periodos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); reset(); setModal(true) }
  const openEdit   = (p: PeriodoAcademico) => {
    setEditing(p)
    reset({ nombre: p.nombre, cicloEscolar: p.cicloEscolar,
            fechaInicio: p.fechaInicio?.slice(0,10), fechaCierre: p.fechaCierre?.slice(0,10) })
    setModal(true)
  }

  const onSubmit = async (data: Form) => {
    try {
      if (editing) { await periodosService.actualizar(editing.id, data); toast.success('Periodo actualizado') }
      else         { await periodosService.crear({ ...data, estado: 'ABIERTO' }); toast.success('Periodo creado') }
      setModal(false); load()
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al guardar')
    }
  }

  const handleCambiarEstado = async () => {
    if (!closeItem) return
    const nuevoEstado = closeItem.estado === 'ABIERTO' ? 'CERRADO' : 'ABIERTO'
    try {
      await periodosService.cambiarEstado(closeItem.id, nuevoEstado)
      toast.success(`Periodo ${nuevoEstado === 'CERRADO' ? 'cerrado' : 'abierto'} exitosamente`)
      setCloseItem(null); load()
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Periodos Académicos" subtitle="Administra los periodos de evaluación"
        actions={canManage ? <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Nuevo Periodo</button> : undefined}
      />

      {loading ? <div className="card animate-pulse h-48" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periodos.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{p.nombre}</h3>
                  <p className="text-sm text-gray-400">Ciclo {p.cicloEscolar}</p>
                </div>
                <span className={`badge ${p.estado === 'ABIERTO' ? 'badge-success' : 'badge-gray'}`}>
                  {p.estado === 'ABIERTO' ? <Unlock size={10} className="mr-1" /> : <Lock size={10} className="mr-1" />}
                  {p.estado}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div><span className="font-medium">Inicio:</span> {new Date(p.fechaInicio).toLocaleDateString('es-GT')}</div>
                <div><span className="font-medium">Cierre:</span> {new Date(p.fechaCierre).toLocaleDateString('es-GT')}</div>
              </div>
              {p.estado === 'CERRADO' && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 mb-3">
                  <AlertCircle size={12} /> Periodo cerrado — solo consulta
                </div>
              )}
              {canManage && <div className="flex gap-2">
                {p.estado === 'ABIERTO' && (
                  <button onClick={() => openEdit(p)} className="btn-outline text-xs py-1.5 px-3 flex-1 justify-center">
                    <Edit2 size={13} /> Editar
                  </button>
                )}
                <button onClick={() => setCloseItem(p)}
                  className={`${p.estado === 'ABIERTO' ? 'btn-danger' : 'btn-accent'} text-xs py-1.5 px-3 flex-1 justify-center`}>
                  {p.estado === 'ABIERTO' ? <><Lock size={13}/> Cerrar</> : <><Unlock size={13}/> Reabrir</>}
                </button>
              </div>}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Periodo' : 'Nuevo Periodo'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">Nombre del Periodo *</label>
            <input {...register('nombre')} className={`input ${errors.nombre ? 'input-error' : ''}`} placeholder="Ej: Primer Bimestre" />
          </div>
          <div>
            <label className="label">Ciclo Escolar *</label>
            <input {...register('cicloEscolar')} className={`input ${errors.cicloEscolar ? 'input-error' : ''}`} placeholder="2024" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha Inicio *</label>
              <input type="date" {...register('fechaInicio')} className={`input ${errors.fechaInicio ? 'input-error' : ''}`} />
            </div>
            <div>
              <label className="label">Fecha Cierre *</label>
              <input type="date" {...register('fechaCierre')} className={`input ${errors.fechaCierre ? 'input-error' : ''}`} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Periodo'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!closeItem}
        title={closeItem?.estado === 'ABIERTO' ? 'Cerrar Periodo' : 'Reabrir Periodo'}
        message={`¿${closeItem?.estado === 'ABIERTO' ? 'Cerrar' : 'Reabrir'} el periodo "${closeItem?.nombre}"? ${closeItem?.estado === 'ABIERTO' ? 'No se podrán registrar más notas.' : 'Se podrán registrar notas nuevamente.'}`}
        onConfirm={handleCambiarEstado}
        onCancel={() => setCloseItem(null)}
        confirmLabel={closeItem?.estado === 'ABIERTO' ? 'Cerrar Periodo' : 'Reabrir Periodo'}
      />
    </div>
  )
}
