import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth'
import { registrarAuditoria } from '../utils/audit'
import { calcularPromedioPonderado, calcularEstado } from '../utils/grades'

const prisma = new PrismaClient()

export const listar = async (req: AuthRequest, res: Response): Promise<void> => {
  const { buscar, grado, seccion, estado } = req.query
  const where: Record<string, unknown> = {}
  if (buscar) where.OR = [
    { nombreCompleto: { contains: buscar as string, mode: 'insensitive' } },
    { codigo: { contains: buscar as string, mode: 'insensitive' } },
  ]
  if (grado)   where.grado   = grado
  if (seccion) where.seccion = seccion
  if (estado)  where.estado  = estado
  const estudiantes = await prisma.estudiante.findMany({ where, orderBy: { nombreCompleto: 'asc' } })
  res.json(estudiantes)
}

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
  const { codigo } = req.body
  const existe = await prisma.estudiante.findUnique({ where: { codigo } })
  if (existe) { res.status(409).json({ error: 'El código de estudiante ya existe' }); return }
  const estudiante = await prisma.estudiante.create({ data: req.body })
  await registrarAuditoria(req.user!.id, 'CREAR_ESTUDIANTE', 'ESTUDIANTES', `Creado: ${codigo}`)
  res.status(201).json(estudiante)
}

export const obtener = async (req: AuthRequest, res: Response): Promise<void> => {
  const est = await prisma.estudiante.findUnique({ where: { id: req.params.id } })
  if (!est) { res.status(404).json({ error: 'Estudiante no encontrado' }); return }
  res.json(est)
}

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const est = await prisma.estudiante.update({ where: { id: req.params.id }, data: req.body })
  await registrarAuditoria(req.user!.id, 'EDITAR_ESTUDIANTE', 'ESTUDIANTES', `Editado: ${est.codigo}`)
  res.json(est)
}

export const baja = async (req: AuthRequest, res: Response): Promise<void> => {
  const est = await prisma.estudiante.update({
    where: { id: req.params.id }, data: { estado: 'INACTIVO' },
  })
  await registrarAuditoria(req.user!.id, 'BAJA_ESTUDIANTE', 'ESTUDIANTES', `Baja: ${est.codigo}`)
  res.json(est)
}

export const historial = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const matriculas = await prisma.matricula.findMany({
    where: { estudianteId: id },
    include: {
      curso: { include: { docente: { select: { nombre: true } } } },
      periodo: true,
    },
  })
  const resultado = await Promise.all(
    matriculas.map(async m => {
      const actividades = await prisma.actividadEvaluativa.findMany({
        where: { cursoId: m.cursoId, periodoId: m.periodoId },
      })
      const notas = await prisma.nota.findMany({
        where: { estudianteId: id, actividadId: { in: actividades.map(a => a.id) } },
        include: { actividad: true },
      })
      const promedio = calcularPromedioPonderado(
        notas.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion }))
      )
      return {
        curso: m.curso,
        periodo: m.periodo,
        notas,
        promedio,
        estado: calcularEstado(promedio),
      }
    })
  )
  res.json(resultado)
}
