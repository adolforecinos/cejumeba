import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import { auditoriaService } from '../../services/index'
import type { Auditoria } from '../../types'

const moduloColor: Record<string, string> = {
  AUTH: 'badge-info', ESTUDIANTES: 'badge-success', CURSOS: 'bg-purple-100 text-purple-700 badge',
  PERIODOS: 'badge-warning', ACTIVIDADES: 'bg-pink-100 text-pink-700 badge',
  NOTAS: 'badge-danger', BOLETINES: 'bg-teal-100 text-teal-700 badge',
  REPORTES: 'badge-gray', USUARIOS: 'bg-orange-100 text-orange-700 badge',
}

export default function AuditoriaPage() {
  const [logs,    setLogs]    = useState<Auditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [modulo,  setModulo]  = useState('')

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> | undefined = modulo ? { modulo } : undefined
    auditoriaService.listar(params)
      .then(setLogs)
      .catch(() => toast.error('Error cargando auditoría'))
      .finally(() => setLoading(false))
  }, [modulo])

  const modulos = ['AUTH','ESTUDIANTES','CURSOS','PERIODOS','ACTIVIDADES','NOTAS','BOLETINES','REPORTES','USUARIOS']

  return (
    <div className="space-y-4">
      <PageHeader title="Auditoría del Sistema" subtitle={`${logs.length} eventos registrados`} />

      {/* Filter */}
      <div className="flex items-center gap-3 card !p-4">
        <Filter size={15} className="text-gray-400" />
        <select value={modulo} onChange={e => setModulo(e.target.value)} className="input !w-auto">
          <option value="">Todos los módulos</option>
          {modulos.map(m => <option key={m}>{m}</option>)}
        </select>
        <span className="text-xs text-gray-400 ml-auto">{logs.length} eventos</span>
      </div>

      {/* Timeline */}
      <div className="card">
        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />)}</div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-slate-700" />
            {logs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className="relative pl-12 py-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors rounded-r-xl">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-500 border-2 border-white dark:border-slate-800" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`${moduloColor[log.modulo] ?? 'badge-gray'} text-[10px]`}>{log.modulo}</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{log.accion.replace(/_/g,' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-auto text-xs text-gray-400">
                    <Shield size={11} />
                    <span>{log.usuario?.nombre ?? 'Sistema'}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{new Date(log.createdAt).toLocaleString('es-GT')}</span>
                  </div>
                </div>
                {log.detalle && <p className="text-xs text-gray-400 mt-0.5">{log.detalle}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
