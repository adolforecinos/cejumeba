import React, { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  actions?: (row: T) => React.ReactNode
  pageSize?: number
  emptyMessage?: string
}

export default function DataTable<T extends Record<string, unknown>>({
  data, columns, searchPlaceholder = 'Buscar...', searchKeys = [],
  actions, pageSize = 10, emptyMessage = 'No hay registros',
}: Props<T>) {
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)

  const filtered = search
    ? data.filter(row => searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(search.toLowerCase())))
    : data

  const total = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-3">
      {searchKeys.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder} className="input pl-9 max-w-xs" />
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}
              {actions && <th className="text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-gray-400 dark:text-gray-500">{emptyMessage}</td></tr>
            ) : paged.map((row, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '-')}</td>)}
                {actions && <td className="text-right">{actions(row)}</td>}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
          <span>{filtered.length} registros</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="font-medium">{page}/{total}</span>
            <button disabled={page === total} onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
