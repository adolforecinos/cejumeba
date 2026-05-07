import { Router } from 'express'
import * as ctrl from '../controllers/notas.controller'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

export const notasRouter = Router()
notasRouter.use(authenticate)

notasRouter.get('/', ctrl.listar)
notasRouter.post('/bulk', requireRoles('ADMINISTRADOR', 'DOCENTE'), ctrl.guardarBulk)
notasRouter.put('/:id', requireRoles('ADMINISTRADOR', 'DOCENTE'), ctrl.actualizar)
notasRouter.get('/promedio/:estudianteId', ctrl.promedioEstudiante)
