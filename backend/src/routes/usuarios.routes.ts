import { Router } from 'express'
import * as ctrl from '../controllers/usuarios.controller'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

export const usuariosRouter = Router()
usuariosRouter.use(authenticate, requireRoles('ADMINISTRADOR'))
usuariosRouter.get('/',             ctrl.listar)
usuariosRouter.post('/',            ctrl.crear)
usuariosRouter.put('/:id',          ctrl.actualizar)
usuariosRouter.patch('/:id/estado', ctrl.cambiarEstado)
