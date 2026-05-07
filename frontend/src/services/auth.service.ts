import api from './api'
import type { LoginResponse } from '../types'

export const authService = {
  login: (correo: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { correo, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
}
