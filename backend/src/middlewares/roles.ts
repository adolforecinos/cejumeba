import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export const requireRoles = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' })
      return
    }
    next()
  }
