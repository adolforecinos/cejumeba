import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GraduationCap, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../store/auth.store'

const schema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})
type Form = z.infer<typeof schema>

const quickAccess = [
  { label: 'Admin',     correo: 'admin@cejumeva.edu.gt',      color: 'bg-red-500 hover:bg-red-600' },
  { label: 'Director',  correo: 'director@cejumeva.edu.gt',   color: 'bg-purple-500 hover:bg-purple-600' },
  { label: 'Docente',   correo: 'docente@cejumeva.edu.gt',    color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Secretaria',correo: 'secretaria@cejumeva.edu.gt', color: 'bg-emerald-500 hover:bg-emerald-600' },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuthStore()
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { correo: '', password: '' },
  })

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      const res = await authService.login(data.correo, data.password)
      login(res.user, res.token)
      toast.success(`Bienvenido, ${res.user.nombre.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al iniciar sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (correo: string) => {
    setValue('correo', correo)
    setValue('password', '123456')
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          className="absolute rounded-full bg-white/5 backdrop-blur-sm"
          style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, left: `${10 + i * 15}%`, top: `${10 + i * 12}%` }}
          animate={{ y: [0, -30 + i * 5, 0], x: [0, 15 - i * 3, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center shadow-xl mb-4"
            >
              <GraduationCap size={40} className="text-white" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-2xl font-bold gradient-text">CEJUMEVA Académico
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Gestión académica moderna, segura y centralizada
            </motion.p>
          </div>

          {/* Quick access */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mb-6">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-center font-medium">Acceso rápido para pruebas</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAccess.map(q => (
                <button key={q.label} type="button" onClick={() => quickLogin(q.correo)}
                  className={`${q.color} text-white text-[10px] font-semibold py-2 px-1 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm`}>
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('correo')} type="email" placeholder="usuario@cejumeva.edu.gt"
                  className={`input pl-9 ${errors.correo ? 'input-error' : ''}`} />
              </div>
              {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3 text-base justify-center mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Ingresando...</span>
              ) : (
                <span className="flex items-center gap-2"><LogIn size={18} />Ingresar al Sistema</span>
              )}
            </motion.button>
          </motion.form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Instituto CEJUMEVA · Sistema Académico 2024
          </p>
        </div>
      </motion.div>
    </div>
  )
}
