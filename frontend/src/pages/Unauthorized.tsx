import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="card text-center p-12 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <ShieldX size={40} className="text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Acceso Restringido</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          No tienes permisos para acceder a esta sección del sistema.
        </p>
        <button onClick={() => navigate(-1)} className="btn-primary justify-center">
          <ArrowLeft size={16}/> Volver
        </button>
      </motion.div>
    </div>
  )
}
