import { Router } from 'express'
import * as ctrl from '../controllers/estudiantes.controller'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

export const estudiantesRouter = Router()
estudiantesRouter.use(authenticate)
estudiantesRouter.get('/',          ctrl.listar)
estudiantesRouter.post('/',         requireRoles('ADMINISTRADOR', 'SECRETARIA'), ctrl.crear)
estudiantesRouter.get('/:id',       ctrl.obtener)
estudiantesRouter.put('/:id',       requireRoles('ADMINISTRADOR', 'SECRETARIA'), ctrl.actualizar)
estudiantesRouter.delete('/:id',    requireRoles('ADMINISTRADOR', 'SECRETARIA'), ctrl.baja)
estudiantesRouter.get('/:id/historial', ctrl.historial)
