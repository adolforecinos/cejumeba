import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middlewares/auth'
import { requireRoles } from '../middlewares/roles'

const prisma = new PrismaClient()
export const auditoriaRouter = Router()
auditoriaRouter.use(authenticate, requireRoles('ADMINISTRADOR', 'DIRECTOR'))
auditoriaRouter.get('/', async (req, res) => {
  const { modulo, usuarioId } = req.query
  const where: Record<string, unknown> = {}
  if (modulo)    where.modulo    = modulo
  if (usuarioId) where.usuarioId = usuarioId
  const logs = await prisma.auditoria.findMany({
    where,
    include: { usuario: { select: { nombre: true, rol: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  res.json(logs)
})
