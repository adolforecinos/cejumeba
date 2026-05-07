import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  title?: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  loading?: boolean
}

export default function ConfirmDialog({ open, title = '¿Estás seguro?', message, onConfirm, onCancel, confirmLabel = 'Confirmar', loading }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-slate-700"
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="btn-ghost text-sm px-4 py-2 rounded-xl">Cancelar</button>
              <button onClick={onConfirm} disabled={loading}
                className="btn-danger text-sm px-4 py-2 rounded-xl disabled:opacity-50">
                {loading ? 'Procesando...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
