import { Router } from 'express'
import * as ctrl from '../controllers/reportes.controller'
import { authenticate } from '../middlewares/auth'

export const reportesRouter = Router()
reportesRouter.use(authenticate)
reportesRouter.get('/dashboard',           ctrl.dashboard)
reportesRouter.get('/rendimiento-cursos',  ctrl.rendimientoCursos)
reportesRouter.get('/estudiantes-riesgo',  ctrl.estudiantesEnRiesgo)
reportesRouter.get('/promedios-grado',     ctrl.promediosPorGrado)
reportesRouter.get('/aprobados-reprobados',ctrl.aprobadosReprobados)
