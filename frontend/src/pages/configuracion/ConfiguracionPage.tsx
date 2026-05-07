import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import { configuracionService } from '../../services/index'
import { useAppStore } from '../../store/app.store'
import type { Configuracion } from '../../types'

export default function ConfiguracionPage() {
  const [config,   setConfig]   = useState<Configuracion | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const { darkMode, toggleDarkMode } = useAppStore()

  useEffect(() => {
    configuracionService.obtener()
      .then(setConfig)
      .catch(() => toast.error('Error cargando configuración'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const updated = await configuracionService.actualizar(config)
      setConfig(updated)
      toast.success('Configuración guardada exitosamente')
    } catch { toast.error('Error al guardar configuración') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="card animate-pulse h-64" />

  return (
    <div className="space-y-4 max-w-2xl">
      <PageHeader title="Configuración del Sistema" subtitle="Parámetros institucionales y académicos" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center">
            <Settings size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Parámetros Institucionales</h3>
            <p className="text-xs text-gray-400">Configuración general del sistema académico</p>
          </div>
        </div>

        <div>
          <label className="label">Nombre de la Institución</label>
          <input value={config?.nombreInstitucion ?? ''} onChange={e => setConfig(c => c ? { ...c, nombreInstitucion: e.target.value } : c)}
            className="input" placeholder="Instituto CEJUMEVA" />
        </div>

        <div>
          <label className="label">Ciclo Escolar Activo</label>
          <input value={config?.cicloEscolarActivo ?? ''} onChange={e => setConfig(c => c ? { ...c, cicloEscolarActivo: e.target.value } : c)}
            className="input" placeholder="2024" />
        </div>

        <div>
          <label className="label">Nota Mínima Aprobatoria</label>
          <div className="flex items-center gap-3">
            <input type="number" min={0} max={100}
              value={config?.notaMinimaAprobatoria ?? 60}
              onChange={e => setConfig(c => c ? { ...c, notaMinimaAprobatoria: Number(e.target.value) } : c)}
              className="input !w-28" />
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>🟢 Aprobado: ≥ 70</p>
              <p>🟡 En Riesgo: {config?.notaMinimaAprobatoria ?? 60}–69</p>
              <p>🔴 Reprobado: &lt; {config?.notaMinimaAprobatoria ?? 60}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-slate-700">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo Oscuro</p>
            <p className="text-xs text-gray-400">Cambia entre tema claro y oscuro</p>
          </div>
          <button onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${darkMode ? 'bg-accent-500' : 'bg-gray-200 dark:bg-slate-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-sm text-primary-700 dark:text-primary-300">
            <p className="font-semibold mb-1">CEJUMEVA Académico v1.0</p>
            <p className="text-xs opacity-70">Sistema Web de Gestión Académica Escolar</p>
            <p className="text-xs opacity-70 mt-1">React 18 · Node.js · PostgreSQL 16 · Docker</p>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center py-3">
          <Save size={16}/> {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </motion.div>
    </div>
  )
}
