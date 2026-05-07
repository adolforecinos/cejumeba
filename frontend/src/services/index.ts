import api from './api'
import { cursosService } from './cursos.service'
import { estudiantesService } from './estudiantes.service'
import type { PeriodoAcademico, ActividadEvaluativa, Nota, Boletin, Usuario, Auditoria, Configuracion, DashboardData, RendimientoCurso, PromedioGrado, AprobadosReprobados, EstudianteRiesgo } from '../types'

export { cursosService, estudiantesService }

export const periodosService = {
  listar: () => api.get<PeriodoAcademico[]>('/periodos').then(r => r.data),
  crear: (data: Partial<PeriodoAcademico>) => api.post<PeriodoAcademico>('/periodos', data).then(r => r.data),
  actualizar: (id: string, data: Partial<PeriodoAcademico>) => api.put<PeriodoAcademico>(`/periodos/${id}`, data).then(r => r.data),
  cambiarEstado: (id: string, estado: string) => api.patch(`/periodos/${id}/estado`, { estado }).then(r => r.data),
}

export const actividadesService = {
  listar: (params?: Record<string, string>) => api.get<ActividadEvaluativa[]>('/actividades', { params }).then(r => r.data),
  crear: (data: Partial<ActividadEvaluativa>) => api.post<ActividadEvaluativa>('/actividades', data).then(r => r.data),
  actualizar: (id: string, data: Partial<ActividadEvaluativa>) => api.put<ActividadEvaluativa>(`/actividades/${id}`, data).then(r => r.data),
  eliminar: (id: string) => api.delete(`/actividades/${id}`).then(r => r.data),
}

export const notasService = {
  listar: (params?: Record<string, string>) => api.get<Nota[]>('/notas', { params }).then(r => r.data),
  guardarBulk: (notas: { estudianteId: string; actividadId: string; valor: number }[]) =>
    api.post('/notas/bulk', { notas }).then(r => r.data),
  actualizar: (id: string, valor: number) => api.put(`/notas/${id}`, { valor }).then(r => r.data),
  promedioEstudiante: (estudianteId: string) => api.get(`/notas/promedio/${estudianteId}`).then(r => r.data),
}

export const boletinesService = {
  generar: (estudianteId: string, periodoId: string) =>
    api.get<Boletin>(`/boletines/${estudianteId}/${periodoId}`).then(r => r.data),
}

export const reportesService = {
  dashboard: () => api.get<DashboardData>('/reportes/dashboard').then(r => r.data),
  rendimientoCursos: () => api.get<RendimientoCurso[]>('/reportes/rendimiento-cursos').then(r => r.data),
  estudiantesRiesgo: () => api.get<EstudianteRiesgo[]>('/reportes/estudiantes-riesgo').then(r => r.data),
  promediosPorGrado: () => api.get<PromedioGrado[]>('/reportes/promedios-grado').then(r => r.data),
  aprobadosReprobados: () => api.get<AprobadosReprobados>('/reportes/aprobados-reprobados').then(r => r.data),
}

export const usuariosService = {
  listar: () => api.get<Usuario[]>('/usuarios').then(r => r.data),
  crear: (data: Partial<Usuario> & { password: string }) => api.post<Usuario>('/usuarios', data).then(r => r.data),
  actualizar: (id: string, data: Partial<Usuario>) => api.put<Usuario>(`/usuarios/${id}`, data).then(r => r.data),
  cambiarEstado: (id: string, estado: string) => api.patch(`/usuarios/${id}/estado`, { estado }).then(r => r.data),
}

export const auditoriaService = {
  listar: (params?: Record<string, string>) => api.get<Auditoria[]>('/auditoria', { params }).then(r => r.data),
}

export const configuracionService = {
  obtener: () => api.get<Configuracion>('/configuracion').then(r => r.data),
  actualizar: (data: Partial<Configuracion>) => api.put<Configuracion>('/configuracion', data).then(r => r.data),
}
