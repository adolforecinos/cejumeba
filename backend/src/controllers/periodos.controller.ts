import { Response } from 'express'
import { PrismaClient, EstadoPeriodo } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth'
import { registrarAuditoria } from '../utils/audit'

const prisma = new PrismaClient()

export const listar = async (_req: AuthRequest, res: Response): Promise<void> => {
  const periodos = await prisma.periodoAcademico.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(periodos)
}

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
  const periodo = await prisma.periodoAcademico.create({ data: req.body })
  await registrarAuditoria(req.user!.id, 'CREAR_PERIODO', 'PERIODOS', `Creado: ${periodo.nombre}`)
  res.status(201).json(periodo)
}

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id: req.params.id } })
  if (!periodo) { res.status(404).json({ error: 'Periodo no encontrado' }); return }
  if (periodo.estado === EstadoPeriodo.CERRADO) {
    res.status(400).json({ error: 'No se puede modificar un periodo cerrado' }); return
  }
  const updated = await prisma.periodoAcademico.update({ where: { id: req.params.id }, data: req.body })
  res.json(updated)
}

export const cambiarEstado = async (req: AuthRequest, res: Response): Promise<void> => {
  const { estado } = req.body
  const periodo = await prisma.periodoAcademico.update({
    where: { id: req.params.id }, data: { estado },
  })
  await registrarAuditoria(req.user!.id,
    estado === 'CERRADO' ? 'CERRAR_PERIODO' : 'ABRIR_PERIODO',
    'PERIODOS', `${periodo.nombre} → ${estado}`)
  res.json(periodo)
}
