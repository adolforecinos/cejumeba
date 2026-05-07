// ─── Enums ─────────────────────────────────────────────────────────────────
export type Rol = 'ADMINISTRADOR' | 'DIRECTOR' | 'DOCENTE' | 'SECRETARIA'
export type EstadoUsuario    = 'ACTIVO' | 'INACTIVO'
export type EstadoEstudiante = 'ACTIVO' | 'INACTIVO' | 'EGRESADO'
export type EstadoPeriodo    = 'ABIERTO' | 'CERRADO'
export type EstadoCurso      = 'ACTIVO' | 'INACTIVO'
export type TipoActividad    = 'TAREA' | 'EXAMEN' | 'PROYECTO' | 'LABORATORIO' | 'PARTICIPACION'
export type EstadoNota       = 'APROBADO' | 'EN_RIESGO' | 'REPROBADO'

// ─── Entidades ─────────────────────────────────────────────────────────────
export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
  estado: EstadoUsuario
  ultimoAcceso?: string
  createdAt?: string
}

export interface Estudiante {
  id: string
  codigo: string
  nombreCompleto: string
  grado: string
  seccion: string
  fechaNacimiento?: string
  encargado?: string
  telefono?: string
  estado: EstadoEstudiante
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface PeriodoAcademico {
  id: string
  nombre: string
  cicloEscolar: string
  fechaInicio: string
  fechaCierre: string
  estado: EstadoPeriodo
  createdAt?: string
}

export interface Curso {
  id: string
  codigo: string
  nombre: string
  grado: string
  seccion: string
  docenteId: string
  docente?: { id: string; nombre: string }
  periodoId: string
  periodo?: PeriodoAcademico
  estado: EstadoCurso
  actividades?: ActividadEvaluativa[]
}

export interface ActividadEvaluativa {
  id: string
  cursoId: string
  curso?: Curso
  periodoId: string
  periodo?: PeriodoAcademico
  nombre: string
  tipo: TipoActividad
  fecha: string
  ponderacion: number
  descripcion?: string
}

export interface Nota {
  id: string
  estudianteId: string
  estudiante?: Estudiante
  actividadId: string
  actividad?: ActividadEvaluativa
  valor: number
  registradoPorId: string
  registradoPor?: { nombre: string }
  createdAt?: string
  updatedAt?: string
}

export interface Auditoria {
  id: string
  usuarioId?: string
  usuario?: { nombre: string; rol: Rol }
  accion: string
  modulo: string
  detalle?: string
  ip?: string
  createdAt: string
}

export interface Configuracion {
  id: string
  nombreInstitucion: string
  cicloEscolarActivo: string
  notaMinimaAprobatoria: number
}

// ─── Boletín ───────────────────────────────────────────────────────────────
export interface BoletinCurso {
  curso: Curso
  actividades: (ActividadEvaluativa & { nota: number | null })[]
  promedio: number
  estado: EstadoNota
}

export interface Boletin {
  estudiante: Estudiante
  periodo: PeriodoAcademico
  cursos: BoletinCurso[]
  promedioGeneral: number
  estadoGeneral: EstadoNota
  generadoEn: string
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  nombre: string
  correo: string
  rol: Rol
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

// ─── Reportes ──────────────────────────────────────────────────────────────
export interface DashboardData {
  totalEstudiantes: number
  totalCursos: number
  totalActividades: number
  totalUsuarios: number
  periodosAbiertos: number
  ultimasNotas: Nota[]
}

export interface RendimientoCurso {
  nombre: string
  promedio: number
  estudiantes: number
}

export interface PromedioGrado {
  grado: string
  promedio: number
  total: number
}

export interface AprobadosReprobados {
  aprobados: number
  enRiesgo: number
  reprobados: number
  total: number
}

export interface EstudianteRiesgo {
  estudiante: Estudiante
  curso: Curso
  promedio: number
  estado: EstadoNota
}

// ─── Historial ─────────────────────────────────────────────────────────────
export interface HistorialItem {
  curso: Curso
  periodo: PeriodoAcademico
  notas: Nota[]
  promedio: number
  estado: EstadoNota
}
