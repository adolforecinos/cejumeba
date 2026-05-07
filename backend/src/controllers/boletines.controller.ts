import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth'
import { registrarAuditoria } from '../utils/audit'
import { calcularPromedioPonderado, calcularEstado } from '../utils/grades'

const prisma = new PrismaClient()

export const generarBoletin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { estudianteId, periodoId } = req.params
  const estudiante = await prisma.estudiante.findUnique({ where: { id: estudianteId } })
  if (!estudiante) { res.status(404).json({ error: 'Estudiante no encontrado' }); return }
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id: periodoId } })
  if (!periodo) { res.status(404).json({ error: 'Periodo no encontrado' }); return }
  const matriculas = await prisma.matricula.findMany({
    where: { estudianteId, periodoId },
    include: { curso: { include: { docente: { select: { nombre: true } } } } },
  })
  const cursos = await Promise.all(
    matriculas.map(async m => {
      const actividades = await prisma.actividadEvaluativa.findMany({ where: { cursoId: m.cursoId, periodoId } })
      const notas = await prisma.nota.findMany({
        where: { estudianteId, actividadId: { in: actividades.map(a => a.id) } },
        include: { actividad: true },
      })
      const promedio = calcularPromedioPonderado(notas.map(n => ({ valor: n.valor, ponderacion: n.actividad.ponderacion })))
      return {
        curso: m.curso,
        actividades: actividades.map(a => ({
          ...a,
          nota: notas.find(n => n.actividadId === a.id)?.valor ?? null,
        })),
        promedio,
        estado: calcularEstado(promedio),
      }
    })
  )
  const promedioGeneral = cursos.length
    ? cursos.reduce((s, c) => s + c.promedio, 0) / cursos.length
    : 0
  await registrarAuditoria(req.user!.id, 'GENERAR_BOLETIN', 'BOLETINES', `Boletín: ${estudiante.codigo} - ${periodo.nombre}`)
  res.json({
    estudiante,
    periodo,
    cursos,
    promedioGeneral: Math.round(promedioGeneral * 100) / 100,
    estadoGeneral: calcularEstado(promedioGeneral),
    generadoEn: new Date(),
  })
}
