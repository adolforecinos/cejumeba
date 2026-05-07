import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, BookOpen, Calendar, ClipboardList,
  FileText, Printer, History, BarChart3, Shield, Settings,
  GraduationCap, LogOut, ChevronLeft, ChevronRight, UserCheck,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useAppStore }  from '../../store/app.store'
import type { Rol } from '../../types'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  roles: Rol[]
}

const navItems: NavItem[] = [
  { to: '/dashboard',     label: 'Dashboard',       icon: <LayoutDashboard size={18} />, roles: ['ADMINISTRADOR','DIRECTOR','DOCENTE','SECRETARIA'] },
  { to: '/estudiantes',   label: 'Estudiantes',     icon: <Users size={18} />,           roles: ['ADMINISTRADOR','DIRECTOR','SECRETARIA','DOCENTE'] },
  { to: '/cursos',        label: 'Cursos',          icon: <BookOpen size={18} />,        roles: ['ADMINISTRADOR','DIRECTOR','DOCENTE','SECRETARIA'] },
  { to: '/periodos',      label: 'Periodos',        icon: <Calendar size={18} />,        roles: ['ADMINISTRADOR','DIRECTOR'] },
  { to: '/actividades',   label: 'Actividades',     icon: <ClipboardList size={18} />,   roles: ['ADMINISTRADOR','DOCENTE'] },
  { to: '/notas',         label: 'Registro Notas',  icon: <FileText size={18} />,        roles: ['ADMINISTRADOR','DOCENTE'] },
  { to: '/boletines',     label: 'Boletines',       icon: <Printer size={18} />,         roles: ['ADMINISTRADOR','DIRECTOR','DOCENTE','SECRETARIA'] },
  { to: '/historial',     label: 'Historial',       icon: <History size={18} />,         roles: ['ADMINISTRADOR','DIRECTOR','SECRETARIA','DOCENTE'] },
  { to: '/reportes',      label: 'Reportes',        icon: <BarChart3 size={18} />,       roles: ['ADMINISTRADOR','DIRECTOR'] },
  { to: '/usuarios',      label: 'Usuarios',        icon: <UserCheck size={18} />,       roles: ['ADMINISTRADOR'] },
  { to: '/auditoria',     label: 'Auditoría',       icon: <Shield size={18} />,          roles: ['ADMINISTRADOR','DIRECTOR'] },
  { to: '/configuracion', label: 'Configuración',   icon: <Settings size={18} />,        roles: ['ADMINISTRADOR'] },
]

export default function Sidebar() {
  const { user, logout }       = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const navigate = useNavigate()

  const filtered = navItems.filter(i => user && i.roles.includes(user.rol))

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-64 z-30 flex flex-col
                   bg-primary-900 dark:bg-slate-900 shadow-2xl
                   border-r border-primary-800/50 dark:border-slate-700"
      >
        {/* Header */}
        <div className="p-5 border-b border-primary-800/50 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">CEJUMEVA</h1>
              <p className="text-accent-400 text-[10px] leading-tight">Académico</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {filtered.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) =>
              isActive ? 'sidebar-item-active flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-accent-600 text-white shadow-md'
                       : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-200 hover:bg-primary-800/60 hover:text-white transition-all duration-200'
            }>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-primary-800/50 dark:border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary-800/40">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.nombre?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.nombre}</p>
              <p className="text-primary-300 text-[10px] truncate">{user?.rol}</p>
            </div>
            <button onClick={handleLogout} className="text-primary-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10" title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-accent-600 text-white shadow-lg hidden lg:flex items-center justify-center hover:bg-accent-500 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </motion.aside>
    </>
  )
}
