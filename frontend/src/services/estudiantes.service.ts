import api from './api'
import type { Estudiante } from '../types'

export const estudiantesService = {
  listar: (params?: Record<string, string>) =>
    api.get<Estudiante[]>('/estudiantes', { params }).then(r => r.data),
  obtener: (id: string) =>
    api.get<Estudiante>(`/estudiantes/${id}`).then(r => r.data),
  crear: (data: Partial<Estudiante>) =>
    api.post<Estudiante>('/estudiantes', data).then(r => r.data),
  actualizar: (id: string, data: Partial<Estudiante>) =>
    api.put<Estudiante>(`/estudiantes/${id}`, data).then(r => r.data),
  baja: (id: string) =>
    api.delete(`/estudiantes/${id}`).then(r => r.data),
  historial: (id: string) =>
    api.get(`/estudiantes/${id}/historial`).then(r => r.data),
}
