import express from 'express'
import cors from 'cors'
import { authRouter }         from './routes/auth.routes'
import { estudiantesRouter }  from './routes/estudiantes.routes'
import { cursosRouter }       from './routes/cursos.routes'
import { periodosRouter }     from './routes/periodos.routes'
import { actividadesRouter }  from './routes/actividades.routes'
import { notasRouter }        from './routes/notas.routes'
import { boletinesRouter }    from './routes/boletines.routes'
import { reportesRouter }     from './routes/reportes.routes'
import { usuariosRouter }     from './routes/usuarios.routes'
import { auditoriaRouter }    from './routes/auditoria.routes'
import { configuracionRouter} from './routes/configuracion.routes'

const app  = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Routes
app.use('/api/auth',          authRouter)
app.use('/api/estudiantes',   estudiantesRouter)
app.use('/api/cursos',        cursosRouter)
app.use('/api/periodos',      periodosRouter)
app.use('/api/actividades',   actividadesRouter)
app.use('/api/notas',         notasRouter)
app.use('/api/boletines',     boletinesRouter)
app.use('/api/reportes',      reportesRouter)
app.use('/api/usuarios',      usuariosRouter)
app.use('/api/auditoria',     auditoriaRouter)
app.use('/api/configuracion', configuracionRouter)

// 404
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor', detail: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 CEJUMEVA Backend corriendo en http://localhost:${PORT}`)
})

export default app
