import api from './api'
import type { Curso } from '../types'

export const cursosService = {
  listar: () => api.get<Curso[]>('/cursos').then(r => r.data),
  obtener: (id: string) => api.get<Curso>(`/cursos/${id}`).then(r => r.data),
  crear: (data: Partial<Curso>) => api.post<Curso>('/cursos', data).then(r => r.data),
  actualizar: (id: string, data: Partial<Curso>) => api.put<Curso>(`/cursos/${id}`, data).then(r => r.data),
  estudiantes: (id: string) => api.get(`/cursos/${id}/estudiantes`).then(r => r.data),
  actualizarEstudiantes: (id: string, estudianteIds: string[]) =>
    api.put(`/cursos/${id}/estudiantes`, { estudianteIds }).then(r => r.data),
  promedio: (id: string) => api.get(`/cursos/${id}/promedio`).then(r => r.data),
}
