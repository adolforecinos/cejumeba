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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore()
  return auth.isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<DashboardPage />} />
        <Route path="estudiantes"    element={<EstudiantesPage />} />
        <Route path="estudiantes/:id" element={<EstudianteDetail />} />
        <Route path="cursos"         element={<CursosPage />} />
        <Route path="periodos"       element={<PeriodosPage />} />
        <Route path="actividades"    element={<ActividadesPage />} />
        <Route path="notas"          element={<NotasPage />} />
        <Route path="boletines"      element={<BoletinesPage />} />
        <Route path="historial"      element={<HistorialPage />} />
        <Route path="reportes"       element={<ReportesPage />} />
        <Route path="usuarios"       element={<UsuariosPage />} />
        <Route path="auditoria"      element={<AuditoriaPage />} />
        <Route path="configuracion"  element={<ConfiguracionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
