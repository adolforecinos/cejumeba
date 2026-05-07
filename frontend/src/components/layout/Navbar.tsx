import { Menu, Moon, Sun, Bell } from 'lucide-react'
import { useAppStore }  from '../../store/app.store'
import { useAuthStore } from '../../store/auth.store'
import { useLocation, useNavigate }  from 'react-router-dom'
import toast from 'react-hot-toast'

const titles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/estudiantes':  'Gestión de Estudiantes',
  '/cursos':       'Gestión de Cursos',
  '/periodos':     'Periodos Académicos',
  '/actividades':  'Actividades Evaluativas',
  '/notas':        'Registro de Notas',
  '/boletines':    'Boletines Académicos',
  '/historial':    'Historial Académico',
  '/reportes':     'Reportes Institucionales',
  '/usuarios':     'Gestión de Usuarios',
  '/auditoria':    'Auditoría del Sistema',
  '/configuracion':'Configuración',
}

export default function Navbar() {
  const { toggleSidebar, toggleDarkMode, darkMode } = useAppStore()
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const title = titles[location.pathname] ?? 'CEJUMEVA Académico'

  const rolColor: Record<string, string> = {
    ADMINISTRADOR: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    DIRECTOR:      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    DOCENTE:       'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    SECRETARIA:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700
                       flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors">
          <Menu size={20} />
        </button>
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm lg:text-base">{title}</h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">Instituto CEJUMEVA · {new Date().toLocaleDateString('es-GT', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={() => {
            if (user?.rol === 'ADMINISTRADOR' || user?.rol === 'DIRECTOR') navigate('/auditoria')
            else toast('Sin notificaciones nuevas')
          }}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors relative"
          title="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-100 dark:border-slate-700">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center text-white font-bold text-xs shadow">
            {user?.nombre?.charAt(0) ?? 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">{user?.nombre?.split(' ')[0]}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${rolColor[user?.rol ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
              {user?.rol}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
