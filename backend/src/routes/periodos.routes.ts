import { Router } from 'express'
import * as ctrl from '../controllers/periodos.controller'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

export const periodosRouter = Router()
periodosRouter.use(authenticate)
periodosRouter.get('/',            ctrl.listar)
periodosRouter.post('/',           requireRoles('ADMINISTRADOR'), ctrl.crear)
periodosRouter.put('/:id',         requireRoles('ADMINISTRADOR'), ctrl.actualizar)
periodosRouter.patch('/:id/estado',requireRoles('ADMINISTRADOR'), ctrl.cambiarEstado)
