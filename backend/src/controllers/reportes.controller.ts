import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth'
import { calcularPromedioPonderado, calcularEstado } from '../utils/grades'

const prisma = new PrismaClient()

export const dashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalEstudiantes, totalCursos, totalActividades, totalUsuarios, periodosAbiertos] = await Promise.all([
    prisma.estudiante.count({ where: { estado: 'ACTIVO' } }),
    prisma.curso.count({ where: { estado: 'ACTIVO' } }),
    prisma.actividadEvaluativa.count(),
    prisma.usuario.count({ where: { estado: 'ACTIVO' } }),
    prisma.periodoAcademico.count({ where: { estado: 'ABIERTO' } }),
  ])
  const ultimasNotas = await prisma.nota.findMany({
    take: 10, orderBy: { createdAt: 'desc' },
    include: { estudiante: true, actividad: { include: { curso: true } }, registradoPor: { select: { nombre: true } } },
  })
  res.json({ totalEstudiantes, totalCursos, totalActividades, totalUsuarios, periodosAbiertos, ultimasNotas })
}

export const rendimientoCursos = async (_req: AuthRequest, res: Response): Promise<void> => {
  const cursos = await prisma.curso.findMany({ where: { estado: 'ACTIVO' }, include: { actividades: true } })
  const resultado = await Promise.all(cursos.map(async c => {
    const matriculas = await prisma.matricula.findMany({ where: { cursoId: c.id } })
    const promedios = await Promise.all(matriculas.map(async m => {
      const notas = await prisma.nota.findMany({ where: { estudianteId: m.estudianteId, actividadId: { in: c.actividades.map(a => a.id) } }, include: { actividad: true } })
      return calcularPromedioPonderado(notas.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion })))
    }))
    const prom = promedios.length ? promedios.reduce((s, p) => s + p, 0) / promedios.length : 0
    return { nombre: c.nombre, promedio: Math.round(prom * 100) / 100, estudiantes: matriculas.length }
  }))
  res.json(resultado)
}

export const estudiantesEnRiesgo = async (_req: AuthRequest, res: Response): Promise<void> => {
  const matriculas = await prisma.matricula.findMany({
    include: { estudiante: true, curso: { include: { actividades: true } } },
  })
  const riesgo: unknown[] = []
  for (const m of matriculas) {
    const notas = await prisma.nota.findMany({
      where: { estudianteId: m.estudianteId, actividadId: { in: m.curso.actividades.map(a => a.id) } },
      include: { actividad: true },
    })
    const prom = calcularPromedioPonderado(notas.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion })))
    const estado = calcularEstado(prom)
    if (estado !== 'APROBADO' && prom > 0) {
      riesgo.push({ estudiante: m.estudiante, curso: m.curso, promedio: prom, estado })
    }
  }
  res.json(riesgo)
}

export const promediosPorGrado = async (_req: AuthRequest, res: Response): Promise<void> => {
  const estudiantes = await prisma.estudiante.findMany({ where: { estado: 'ACTIVO' } })
  const porGrado: Record<string, number[]> = {}
  for (const e of estudiantes) {
    const notas = await prisma.nota.findMany({ where: { estudianteId: e.id }, include: { actividad: true } })
    const prom = calcularPromedioPonderado(notas.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion })))
    if (prom > 0) {
      if (!porGrado[e.grado]) porGrado[e.grado] = []
      porGrado[e.grado].push(prom)
    }
  }
  const resultado = Object.entries(porGrado).map(([grado, proms]) => ({
    grado,
    promedio: Math.round((proms.reduce((s, p) => s + p, 0) / proms.length) * 100) / 100,
    total: proms.length,
  }))
  res.json(resultado)
}

export const aprobadosReprobados = async (_req: AuthRequest, res: Response): Promise<void> => {
  const matriculas = await prisma.matricula.findMany({
    include: { curso: { include: { actividades: true } } },
  })
  let aprobados = 0, enRiesgo = 0, reprobados = 0
  for (const m of matriculas) {
    const notas = await prisma.nota.findMany({
      where: { estudianteId: m.estudianteId, actividadId: { in: m.curso.actividades.map(a => a.id) } },
      include: { actividad: true },
    })
    if (notas.length === 0) continue
    const prom = calcularPromedioPonderado(notas.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion })))
    const estado = calcularEstado(prom)
    if (estado === 'APROBADO') aprobados++
    else if (estado === 'EN_RIESGO') enRiesgo++
    else reprobados++
  }
  res.json({ aprobados, enRiesgo, reprobados, total: aprobados + enRiesgo + reprobados })
}
