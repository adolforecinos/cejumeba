import { Router } from 'express'
import * as ctrl from '../controllers/actividades.controller'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

export const actividadesRouter = Router()
actividadesRouter.use(authenticate)
actividadesRouter.get('/',     ctrl.listar)
actividadesRouter.post('/',    requireRoles('ADMINISTRADOR', 'DOCENTE'), ctrl.crear)
actividadesRouter.put('/:id',  requireRoles('ADMINISTRADOR', 'DOCENTE'), ctrl.actualizar)
actividadesRouter.delete('/:id', requireRoles('ADMINISTRADOR', 'DOCENTE'), ctrl.eliminar)
