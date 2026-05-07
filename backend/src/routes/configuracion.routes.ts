import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

const prisma = new PrismaClient()
export const configuracionRouter = Router()
configuracionRouter.use(authenticate)

configuracionRouter.get('/', async (_req, res) => {
  let config = await prisma.configuracion.findFirst()
  if (!config) config = await prisma.configuracion.create({ data: {} })
  res.json(config)
})

configuracionRouter.put('/', requireRoles('ADMINISTRADOR'), async (req, res) => {
  let config = await prisma.configuracion.findFirst()
  if (!config) {
    config = await prisma.configuracion.create({ data: req.body })
  } else {
    config = await prisma.configuracion.update({ where: { id: config.id }, data: req.body })
  }
  res.json(config)
})
