import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const registrarAuditoria = async (
  usuarioId: string | null,
  accion: string,
  modulo: string,
  detalle?: string,
  ip?: string
) => {
  try {
    await prisma.auditoria.create({
      data: { usuarioId, accion, modulo, detalle, ip },
    })
  } catch (e) {
    console.error('Error registrando auditoría:', e)
  }
}
