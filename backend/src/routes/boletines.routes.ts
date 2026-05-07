import { Router } from 'express'
import * as ctrl from '../controllers/boletines.controller'
import { authenticate } from '../middlewares/auth'

export const boletinesRouter = Router()
boletinesRouter.use(authenticate)
boletinesRouter.get('/:estudianteId/:periodoId', ctrl.generarBoletin)
