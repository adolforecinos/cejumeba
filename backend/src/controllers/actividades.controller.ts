import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth'
import { registrarAuditoria } from '../utils/audit'

const prisma = new PrismaClient()

export const listar = async (req: AuthRequest, res: Response): Promise<void> => {
  const { cursoId, periodoId } = req.query
  const where: Record<string, unknown> = {}
  if (cursoId)   where.cursoId   = cursoId
  if (periodoId) where.periodoId = periodoId
  const actividades = await prisma.actividadEvaluativa.findMany({
    where,
    include: { curso: true, periodo: true },
    orderBy: { fecha: 'asc' },
  })
  res.json(actividades)
}

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
  const { cursoId, periodoId, ponderacion } = req.body
  // Validar periodo abierto
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id: periodoId } })
  if (periodo?.estado === 'CERRADO') {
    res.status(400).json({ error: 'No se pueden crear actividades en un periodo cerrado' }); return
  }
  // Validar ponderación total
  const existentes = await prisma.actividadEvaluativa.findMany({ where: { cursoId, periodoId } })
  const totalActual = existentes.reduce((s, a) => s + a.ponderacion, 0)
  if (totalActual + ponderacion > 100) {
    res.status(400).json({ error: `La ponderación total excedería 100%. Disponible: ${100 - totalActual}%` }); return
  }
  const actividad = await prisma.actividadEvaluativa.create({
    data: req.body,
    include: { curso: true, periodo: true },
  })
  await registrarAuditoria(req.user!.id, 'CREAR_ACTIVIDAD', 'ACTIVIDADES', `Creada: ${actividad.nombre}`)
  res.status(201).json(actividad)
}

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const actividad = await prisma.actividadEvaluativa.findUnique({ where: { id: req.params.id } })
  if (!actividad) { res.status(404).json({ error: 'Actividad no encontrada' }); return }
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id: actividad.periodoId } })
  if (periodo?.estado === 'CERRADO') {
    res.status(400).json({ error: 'No se puede editar en periodo cerrado' }); return
  }
  const cursoId = req.body.cursoId ?? actividad.cursoId
  const periodoId = req.body.periodoId ?? actividad.periodoId
  const ponderacion = Number(req.body.ponderacion ?? actividad.ponderacion)
  const existentes = await prisma.actividadEvaluativa.findMany({
    where: { cursoId, periodoId, id: { not: actividad.id } },
  })
  const totalActual = existentes.reduce((s, a) => s + a.ponderacion, 0)
  if (totalActual + ponderacion > 100) {
    res.status(400).json({ error: `La ponderación total excedería 100%. Disponible: ${100 - totalActual}%` }); return
  }
  const updated = await prisma.actividadEvaluativa.update({ where: { id: req.params.id }, data: req.body })
  await registrarAuditoria(req.user!.id, 'EDITAR_ACTIVIDAD', 'ACTIVIDADES', `Editada: ${updated.nombre}`)
  res.json(updated)
}

export const eliminar = async (req: AuthRequest, res: Response): Promise<void> => {
  const actividad = await prisma.actividadEvaluativa.findUnique({ where: { id: req.params.id } })
  if (!actividad) { res.status(404).json({ error: 'Actividad no encontrada' }); return }
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id: actividad.periodoId } })
  if (periodo?.estado === 'CERRADO') {
    res.status(400).json({ error: 'No se puede eliminar en periodo cerrado' }); return
  }
  await prisma.nota.deleteMany({ where: { actividadId: req.params.id } })
  await prisma.actividadEvaluativa.delete({ where: { id: req.params.id } })
  await registrarAuditoria(req.user!.id, 'ELIMINAR_ACTIVIDAD', 'ACTIVIDADES', `Eliminada: ${actividad.nombre}`)
  res.json({ message: 'Actividad eliminada' })
}
