import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth'
import { registrarAuditoria } from '../utils/audit'
import { calcularPromedioPonderado, calcularEstado } from '../utils/grades'

const prisma = new PrismaClient()

export const listar = async (_req: AuthRequest, res: Response): Promise<void> => {
  const cursos = await prisma.curso.findMany({
    include: { docente: { select: { id: true, nombre: true } }, periodo: true },
    orderBy: { nombre: 'asc' },
  })
  res.json(cursos)
}

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
  const { codigo } = req.body
  const existe = await prisma.curso.findUnique({ where: { codigo } })
  if (existe) { res.status(409).json({ error: 'El código de curso ya existe' }); return }
  const curso = await prisma.curso.create({
    data: req.body,
    include: { docente: { select: { id: true, nombre: true } }, periodo: true },
  })
  await registrarAuditoria(req.user!.id, 'CREAR_CURSO', 'CURSOS', `Creado: ${codigo}`)
  res.status(201).json(curso)
}

export const obtener = async (req: AuthRequest, res: Response): Promise<void> => {
  const curso = await prisma.curso.findUnique({
    where: { id: req.params.id },
    include: { docente: { select: { id: true, nombre: true } }, periodo: true, actividades: true },
  })
  if (!curso) { res.status(404).json({ error: 'Curso no encontrado' }); return }
  res.json(curso)
}

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const curso = await prisma.curso.update({
    where: { id: req.params.id }, data: req.body,
    include: { docente: { select: { id: true, nombre: true } }, periodo: true },
  })
  await registrarAuditoria(req.user!.id, 'EDITAR_CURSO', 'CURSOS', `Editado: ${curso.codigo}`)
  res.json(curso)
}

export const estudiantes = async (req: AuthRequest, res: Response): Promise<void> => {
  const matriculas = await prisma.matricula.findMany({
    where: { cursoId: req.params.id },
    include: { estudiante: true },
  })
  res.json(matriculas.map(m => m.estudiante))
}

export const actualizarEstudiantes = async (req: AuthRequest, res: Response): Promise<void> => {
  const { estudianteIds } = req.body as { estudianteIds?: string[] }
  if (!Array.isArray(estudianteIds)) {
    res.status(400).json({ error: 'estudianteIds debe ser un arreglo' }); return
  }

  const curso = await prisma.curso.findUnique({ where: { id: req.params.id } })
  if (!curso) { res.status(404).json({ error: 'Curso no encontrado' }); return }

  const estudiantes = await prisma.estudiante.findMany({
    where: { id: { in: estudianteIds }, estado: 'ACTIVO' },
    select: { id: true },
  })
  const idsValidos = estudiantes.map(e => e.id)

  await prisma.$transaction([
    prisma.matricula.deleteMany({ where: { cursoId: curso.id, periodoId: curso.periodoId } }),
    prisma.matricula.createMany({
      data: idsValidos.map(estudianteId => ({
        estudianteId,
        cursoId: curso.id,
        periodoId: curso.periodoId,
      })),
      skipDuplicates: true,
    }),
  ])

  await registrarAuditoria(req.user!.id, 'ACTUALIZAR_MATRICULA', 'CURSOS', `${curso.codigo}: ${idsValidos.length} estudiantes`)
  res.json({ message: 'Matrícula actualizada', total: idsValidos.length })
}

export const promedio = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const actividades = await prisma.actividadEvaluativa.findMany({ where: { cursoId: id } })
  const matriculas  = await prisma.matricula.findMany({ where: { cursoId: id }, include: { estudiante: true } })

  const promedios = await Promise.all(matriculas.map(async m => {
    const notas = await prisma.nota.findMany({
      where: { estudianteId: m.estudianteId, actividadId: { in: actividades.map(a => a.id) } },
      include: { actividad: true },
    })
    const prom = calcularPromedioPonderado(notas.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion })))
    return { estudiante: m.estudiante, promedio: prom, estado: calcularEstado(prom) }
  }))
  const totalProm = promedios.length ? promedios.reduce((s, p) => s + p.promedio, 0) / promedios.length : 0
  res.json({ promedioCurso: Math.round(totalProm * 100) / 100, estudiantes: promedios })
}
