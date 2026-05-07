import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'cejumeva_secret'

export interface JwtPayload {
  id: string
  correo: string
  rol: string
  nombre: string
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: '8h' })

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, SECRET) as JwtPayload
