import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken } from '../utils/jwt'
import { registrarAuditoria } from '../utils/audit'
import { AuthRequest } from '../middlewares/auth'

const prisma = new PrismaClient()

export const login = async (req: Request, res: Response): Promise<void> => {
  const { correo, password } = req.body
  if (!correo || !password) {
    res.status(400).json({ error: 'Correo y contraseña son requeridos' })
    return
  }
  const user = await prisma.usuario.findUnique({ where: { correo } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }
  if (user.estado === 'INACTIVO') {
    res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' })
    return
  }
  await prisma.usuario.update({ where: { id: user.id }, data: { ultimoAcceso: new Date() } })
  await registrarAuditoria(user.id, 'INICIO_SESION', 'AUTH', `Inicio de sesión: ${correo}`, req.ip)
  const token = signToken({ id: user.id, correo: user.correo, rol: user.rol, nombre: user.nombre })
  res.json({ token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol } })
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.usuario.findUnique({
    where: { id: req.user!.id },
    select: { id: true, nombre: true, correo: true, rol: true, estado: true, ultimoAcceso: true },
  })
  if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return }
  res.json(user)
}
