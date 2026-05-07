import { Router } from 'express'
import * as ctrl from '../controllers/cursos.controller'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

export const cursosRouter = Router()
cursosRouter.use(authenticate)
cursosRouter.get('/',                   ctrl.listar)
cursosRouter.post('/',                  requireRoles('ADMINISTRADOR'), ctrl.crear)
cursosRouter.get('/:id',                ctrl.obtener)
cursosRouter.put('/:id',                requireRoles('ADMINISTRADOR'), ctrl.actualizar)
cursosRouter.get('/:id/estudiantes',    ctrl.estudiantes)
cursosRouter.put('/:id/estudiantes',    requireRoles('ADMINISTRADOR', 'SECRETARIA'), ctrl.actualizarEstudiantes)
cursosRouter.get('/:id/promedio',       ctrl.promedio)
