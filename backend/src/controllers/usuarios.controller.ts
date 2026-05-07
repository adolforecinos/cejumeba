import { Response } from 'express'
import { PrismaClient, Rol } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AuthRequest } from '../middlewares/auth'
import { registrarAuditoria } from '../utils/audit'

const prisma = new PrismaClient()

export const listar = async (_req: AuthRequest, res: Response): Promise<void> => {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, correo: true, nombre: true, rol: true, estado: true, ultimoAcceso: true, createdAt: true },
    orderBy: { nombre: 'asc' },
  })
  res.json(usuarios)
}

export const crear = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { correo, password, nombre, rol } = req.body
    if (!password) { res.status(400).json({ error: 'La contraseña es requerida' }); return }
    const pwd = await bcrypt.hash(password, 10)
    const usuario = await prisma.usuario.create({
      data: { correo, password: pwd, nombre, rol },
      select: { id: true, correo: true, nombre: true, rol: true, estado: true, ultimoAcceso: true },
    })
    await registrarAuditoria(req.user!.id, 'CREAR_USUARIO', 'USUARIOS', `Creado: ${correo}`)
    res.status(201).json(usuario)
  } catch {
    res.status(400).json({ error: 'Error al crear usuario. El correo podría ya estar registrado.' })
  }
}

export const actualizar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { correo, nombre, rol, password } = req.body
    const data: { correo?: string; nombre?: string; rol?: Rol; password?: string } = { correo, nombre, rol }
    if (password) data.password = await bcrypt.hash(password, 10)
    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data,
      select: { id: true, correo: true, nombre: true, rol: true, estado: true, ultimoAcceso: true },
    })
    await registrarAuditoria(req.user!.id, 'EDITAR_USUARIO', 'USUARIOS', `Editado: ${usuario.correo}`)
    res.json(usuario)
  } catch {
    res.status(400).json({ error: 'Error al actualizar usuario' })
  }
}

export const cambiarEstado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { estado } = req.body
    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data: { estado },
      select: { id: true, correo: true, nombre: true, rol: true, estado: true, ultimoAcceso: true },
    })
    await registrarAuditoria(req.user!.id, 'CAMBIAR_ESTADO_USUARIO', 'USUARIOS', `${usuario.correo} -> ${estado}`)
    res.json(usuario)
  } catch {
    res.status(400).json({ error: 'Error al cambiar estado del usuario' })
  }
}
