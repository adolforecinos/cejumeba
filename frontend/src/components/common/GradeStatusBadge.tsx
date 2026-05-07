import type { EstadoNota } from '../../types'

interface Props { estado: EstadoNota | string; promedio?: number; size?: 'sm' | 'md' }

export default function GradeStatusBadge({ estado, promedio, size = 'md' }: Props) {
  const config = {
    APROBADO:   { cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800', label: 'Aprobado' },
    EN_RIESGO:  { cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800', label: 'En Riesgo' },
    REPROBADO:  { cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800', label: 'Reprobado' },
  }[estado] ?? { cls: 'bg-gray-100 text-gray-600 border border-gray-200', label: estado }

  const sz = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${config.cls} ${sz}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${estado === 'APROBADO' ? 'bg-emerald-500' : estado === 'EN_RIESGO' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {config.label}
      {promedio !== undefined && <span className="ml-1 font-bold">{promedio.toFixed(1)}</span>}
    </span>
  )
}
