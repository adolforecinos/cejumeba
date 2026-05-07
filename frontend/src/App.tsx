import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import AppLayout from './components/layout/AppLayout'
import LoginPage         from './pages/auth/LoginPage'
import DashboardPage     from './pages/dashboard/DashboardPage'
import EstudiantesPage   from './pages/estudiantes/EstudiantesPage'
import EstudianteDetail  from './pages/estudiantes/EstudianteDetail'
import CursosPage        from './pages/cursos/CursosPage'
import PeriodosPage      from './pages/periodos/PeriodosPage'
import ActividadesPage   from './pages/actividades/ActividadesPage'
import NotasPage         from './pages/notas/NotasPage'
import BoletinesPage     from './pages/boletines/BoletinesPage'
import HistorialPage     from './pages/historial/HistorialPage'
import ReportesPage      from './pages/reportes/ReportesPage'
import UsuariosPage      from './pages/usuarios/UsuariosPage'
import AuditoriaPage     from './pages/auditoria/AuditoriaPage'
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage'
import Unauthorized      from './pages/Unauthorized'
import type { Rol } from './types'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore()
  return auth.isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: Rol[] }) {
  const { user } = useAuthStore()
  return user && roles.includes(user.rol) ? <>{children}</> : <Navigate to="/unauthorized" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<DashboardPage />} />
        <Route path="estudiantes"    element={<RoleRoute roles={['DIRECTOR','SECRETARIA']}><EstudiantesPage /></RoleRoute>} />
        <Route path="estudiantes/:id" element={<RoleRoute roles={['DIRECTOR','SECRETARIA']}><EstudianteDetail /></RoleRoute>} />
        <Route path="cursos"         element={<RoleRoute roles={['DIRECTOR','DOCENTE','SECRETARIA']}><CursosPage /></RoleRoute>} />
        <Route path="periodos"       element={<RoleRoute roles={['DIRECTOR']}><PeriodosPage /></RoleRoute>} />
        <Route path="actividades"    element={<RoleRoute roles={['DOCENTE']}><ActividadesPage /></RoleRoute>} />
        <Route path="notas"          element={<RoleRoute roles={['DOCENTE']}><NotasPage /></RoleRoute>} />
        <Route path="boletines"      element={<RoleRoute roles={['DIRECTOR','SECRETARIA']}><BoletinesPage /></RoleRoute>} />
        <Route path="historial"      element={<RoleRoute roles={['DIRECTOR','SECRETARIA']}><HistorialPage /></RoleRoute>} />
        <Route path="reportes"       element={<RoleRoute roles={['DIRECTOR']}><ReportesPage /></RoleRoute>} />
        <Route path="usuarios"       element={<RoleRoute roles={['ADMINISTRADOR']}><UsuariosPage /></RoleRoute>} />
        <Route path="auditoria"      element={<RoleRoute roles={['ADMINISTRADOR','DIRECTOR']}><AuditoriaPage /></RoleRoute>} />
        <Route path="configuracion"  element={<RoleRoute roles={['ADMINISTRADOR']}><ConfiguracionPage /></RoleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
