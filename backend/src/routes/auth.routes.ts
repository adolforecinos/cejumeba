import { Router } from 'express'
import { login, getMe } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth'

export const authRouter = Router()
authRouter.post('/login', login)
authRouter.get('/me', authenticate, getMe)
