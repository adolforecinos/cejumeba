import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth'
import { registrarAuditoria } from '../utils/audit'
import { calcularPromedioPonderado, calcularEstado } from '../utils/grades'

const prisma = new PrismaClient()

export const listar = async (req: AuthRequest, res: Response): Promise<void> => {
  const { actividadId } = req.query
  const where: Record<string, unknown> = {}
  if (actividadId) where.actividadId = actividadId
  const notas = await prisma.nota.findMany({
    where,
    include: { estudiante: true, actividad: true, registradoPor: { select: { nombre: true } } },
  })
  res.json(notas)
}

export const guardarBulk = async (req: AuthRequest, res: Response): Promise<void> => {
  const { notas }: { notas: { estudianteId: string; actividadId: string; valor: number }[] } = req.body
  if (!Array.isArray(notas) || notas.length === 0) {
    res.status(400).json({ error: 'No hay notas para guardar' }); return
  }

  const actividadId = notas[0]?.actividadId
  const actividad = await prisma.actividadEvaluativa.findUnique({
    where: { id: actividadId },
    include: { periodo: true },
  })
  if (!actividad) { res.status(404).json({ error: 'Actividad no encontrada' }); return }
  if (actividad.periodo.estado === 'CERRADO') {
    res.status(400).json({ error: 'No se pueden registrar notas en un periodo cerrado' }); return
  }

  try {
    const resultados = await Promise.all(
      notas.map(async n => {
        if (!n.estudianteId || n.actividadId !== actividadId || typeof n.valor !== 'number' || n.valor < 0 || n.valor > 100) {
          throw new Error(`Nota inválida: ${n.valor}`)
        }
        const existente = await prisma.nota.findUnique({
          where: { estudianteId_actividadId: { estudianteId: n.estudianteId, actividadId: n.actividadId } },
        })
        if (existente) {
          await prisma.historialNota.create({
            data: { notaId: existente.id, valorAnterior: existente.valor, valorNuevo: n.valor, modificadoPorId: req.user!.id },
          })
          return prisma.nota.update({ where: { id: existente.id }, data: { valor: n.valor } })
        }
        return prisma.nota.create({ data: { ...n, registradoPorId: req.user!.id } })
      })
    )
    await registrarAuditoria(req.user!.id, 'REGISTRAR_NOTA', 'NOTAS', `${notas.length} notas guardadas`)
    res.json(resultados)
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Error al guardar notas' })
  }
}

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const { valor } = req.body
  if (typeof valor !== 'number' || valor < 0 || valor > 100) {
    res.status(400).json({ error: 'La nota debe estar entre 0 y 100' }); return
  }
  const existente = await prisma.nota.findUnique({
    where: { id: req.params.id },
    include: { actividad: { include: { periodo: true } } },
  })
  if (!existente) { res.status(404).json({ error: 'Nota no encontrada' }); return }
  if (existente.actividad.periodo.estado === 'CERRADO') {
    res.status(400).json({ error: 'No se pueden editar notas en un periodo cerrado' }); return
  }
  await prisma.historialNota.create({
    data: { notaId: existente.id, valorAnterior: existente.valor, valorNuevo: valor, modificadoPorId: req.user!.id },
  })
  const nota = await prisma.nota.update({ where: { id: req.params.id }, data: { valor } })
  await registrarAuditoria(req.user!.id, 'EDITAR_NOTA', 'NOTAS', `Nota editada: ${existente.valor} -> ${valor}`)
  res.json(nota)
}

export const promedioEstudiante = async (req: AuthRequest, res: Response): Promise<void> => {
  const { estudianteId } = req.params
  const notas = await prisma.nota.findMany({
    where: { estudianteId },
    include: { actividad: { include: { curso: true, periodo: true } } },
  })
  const porCurso: Record<string, typeof notas> = {}
  for (const n of notas) {
    const key = n.actividad.cursoId
    if (!porCurso[key]) porCurso[key] = []
    porCurso[key].push(n)
  }
  const resultado = Object.entries(porCurso).map(([cursoId, ns]) => {
    const prom = calcularPromedioPonderado(ns.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion })))
    return { cursoId, curso: ns[0].actividad.curso, periodo: ns[0].actividad.periodo, promedio: prom, estado: calcularEstado(prom), notas: ns }
  })
  res.json(resultado)
}
