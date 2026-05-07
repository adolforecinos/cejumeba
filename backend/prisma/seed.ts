import { PrismaClient, Rol, EstadoEstudiante, EstadoPeriodo, EstadoCurso, TipoActividad } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // ─── Limpiar tablas en orden ───────────────────────────────────────────────
  await prisma.auditoria.deleteMany()
  await prisma.historialNota.deleteMany()
  await prisma.nota.deleteMany()
  await prisma.matricula.deleteMany()
  await prisma.actividadEvaluativa.deleteMany()
  await prisma.curso.deleteMany()
  await prisma.periodoAcademico.deleteMany()
  await prisma.estudiante.deleteMany()
  await prisma.configuracion.deleteMany()
  await prisma.usuario.deleteMany()

  const hash = (pw: string) => bcrypt.hashSync(pw, 10)

  // ─── Usuarios ──────────────────────────────────────────────────────────────
  const admin = await prisma.usuario.create({ data: {
    nombre: 'Administrador Sistema', correo: 'admin@cejumeva.edu.gt',
    password: hash('123456'), rol: Rol.ADMINISTRADOR, ultimoAcceso: new Date(),
  }})
  const director = await prisma.usuario.create({ data: {
    nombre: 'Dr. Roberto Méndez', correo: 'director@cejumeva.edu.gt',
    password: hash('123456'), rol: Rol.DIRECTOR, ultimoAcceso: new Date(),
  }})
  const docente1 = await prisma.usuario.create({ data: {
    nombre: 'Prof. Carlos Hernández', correo: 'docente@cejumeva.edu.gt',
    password: hash('123456'), rol: Rol.DOCENTE, ultimoAcceso: new Date(),
  }})
  const docente2 = await prisma.usuario.create({ data: {
    nombre: 'Profa. María Elena Ruiz', correo: 'docente2@cejumeva.edu.gt',
    password: hash('123456'), rol: Rol.DOCENTE,
  }})
  const docente3 = await prisma.usuario.create({ data: {
    nombre: 'Prof. Javier López', correo: 'docente3@cejumeva.edu.gt',
    password: hash('123456'), rol: Rol.DOCENTE,
  }})
  const secretaria = await prisma.usuario.create({ data: {
    nombre: 'Lic. Ana Patricia García', correo: 'secretaria@cejumeva.edu.gt',
    password: hash('123456'), rol: Rol.SECRETARIA, ultimoAcceso: new Date(),
  }})

  // ─── Configuración ─────────────────────────────────────────────────────────
  await prisma.configuracion.create({ data: {
    nombreInstitucion: 'Instituto CEJUMEVA',
    cicloEscolarActivo: '2024',
    notaMinimaAprobatoria: 60,
  }})

  // ─── Periodos ──────────────────────────────────────────────────────────────
  const periodo1 = await prisma.periodoAcademico.create({ data: {
    nombre: 'Primer Bimestre',
    cicloEscolar: '2024',
    fechaInicio: new Date('2024-01-15'),
    fechaCierre: new Date('2024-03-15'),
    estado: EstadoPeriodo.CERRADO,
  }})
  const periodo2 = await prisma.periodoAcademico.create({ data: {
    nombre: 'Segundo Bimestre',
    cicloEscolar: '2024',
    fechaInicio: new Date('2024-03-18'),
    fechaCierre: new Date('2024-05-31'),
    estado: EstadoPeriodo.ABIERTO,
  }})

  // ─── Estudiantes (20) ──────────────────────────────────────────────────────
  const estudiantesData = [
    { codigo: 'EST-001', nombreCompleto: 'María García López',        grado: '3ro Primaria', seccion: 'A', fechaNacimiento: new Date('2014-03-12'), encargado: 'Luis García',     telefono: '5555-1001', observaciones: 'Estudiante destacada' },
    { codigo: 'EST-002', nombreCompleto: 'Juan Pérez Morales',         grado: '3ro Primaria', seccion: 'A', fechaNacimiento: new Date('2014-07-22'), encargado: 'Rosa Morales',    telefono: '5555-1002' },
    { codigo: 'EST-003', nombreCompleto: 'Ana Martínez Ruiz',          grado: '3ro Primaria', seccion: 'A', fechaNacimiento: new Date('2014-01-05'), encargado: 'Pedro Martínez',  telefono: '5555-1003' },
    { codigo: 'EST-004', nombreCompleto: 'Carlos López García',        grado: '3ro Primaria', seccion: 'A', fechaNacimiento: new Date('2013-11-18'), encargado: 'Carmen García',   telefono: '5555-1004' },
    { codigo: 'EST-005', nombreCompleto: 'Laura Hernández Vásquez',    grado: '3ro Primaria', seccion: 'B', fechaNacimiento: new Date('2014-05-30'), encargado: 'Mario Hernández', telefono: '5555-1005' },
    { codigo: 'EST-006', nombreCompleto: 'Miguel González Díaz',       grado: '4to Primaria', seccion: 'A', fechaNacimiento: new Date('2013-08-14'), encargado: 'Elena Díaz',      telefono: '5555-1006' },
    { codigo: 'EST-007', nombreCompleto: 'Sofía Ramírez Cifuentes',    grado: '4to Primaria', seccion: 'A', fechaNacimiento: new Date('2013-02-28'), encargado: 'José Ramírez',    telefono: '5555-1007', observaciones: 'Requiere apoyo en matemáticas' },
    { codigo: 'EST-008', nombreCompleto: 'Diego Sánchez Morales',      grado: '4to Primaria', seccion: 'A', fechaNacimiento: new Date('2013-06-09'), encargado: 'Laura Morales',   telefono: '5555-1008' },
    { codigo: 'EST-009', nombreCompleto: 'Valentina Torres Lima',      grado: '4to Primaria', seccion: 'A', fechaNacimiento: new Date('2013-10-17'), encargado: 'Marcos Torres',   telefono: '5555-1009' },
    { codigo: 'EST-010', nombreCompleto: 'Andrés Flores Monterroso',   grado: '4to Primaria', seccion: 'B', fechaNacimiento: new Date('2013-04-25'), encargado: 'Irma Monterroso', telefono: '5555-1010' },
    { codigo: 'EST-011', nombreCompleto: 'Isabella Cruz Juárez',       grado: '5to Primaria', seccion: 'A', fechaNacimiento: new Date('2012-12-03'), encargado: 'Ricardo Cruz',    telefono: '5555-1011' },
    { codigo: 'EST-012', nombreCompleto: 'Mateo Reyes Archila',        grado: '5to Primaria', seccion: 'A', fechaNacimiento: new Date('2012-09-11'), encargado: 'Patricia Archila', telefono: '5555-1012' },
    { codigo: 'EST-013', nombreCompleto: 'Camila Jiménez López',       grado: '5to Primaria', seccion: 'A', fechaNacimiento: new Date('2012-07-20'), encargado: 'Santiago Jiménez', telefono: '5555-1013' },
    { codigo: 'EST-014', nombreCompleto: 'Sebastián Morales García',   grado: '5to Primaria', seccion: 'B', fechaNacimiento: new Date('2012-03-08'), encargado: 'Claudia García',  telefono: '5555-1014', observaciones: 'Excelente liderazgo' },
    { codigo: 'EST-015', nombreCompleto: 'Natalia Castillo Vásquez',   grado: '6to Primaria', seccion: 'A', fechaNacimiento: new Date('2011-11-27'), encargado: 'Fernando Castillo', telefono: '5555-1015' },
    { codigo: 'EST-016', nombreCompleto: 'Daniel Aguilar Méndez',      grado: '6to Primaria', seccion: 'A', fechaNacimiento: new Date('2011-08-16'), encargado: 'Gloria Méndez',   telefono: '5555-1016' },
    { codigo: 'EST-017', nombreCompleto: 'Valeria Guzmán Torres',      grado: '6to Primaria', seccion: 'A', fechaNacimiento: new Date('2011-05-04'), encargado: 'Alfonso Guzmán',  telefono: '5555-1017' },
    { codigo: 'EST-018', nombreCompleto: 'Lucas Ramírez Caal',         grado: '6to Primaria', seccion: 'A', fechaNacimiento: new Date('2011-02-19'), encargado: 'Isabel Caal',     telefono: '5555-1018' },
    { codigo: 'EST-019', nombreCompleto: 'Alejandra Pérez Lima',       grado: '6to Primaria', seccion: 'B', fechaNacimiento: new Date('2011-09-30'), encargado: 'Jorge Pérez',     telefono: '5555-1019' },
    { codigo: 'EST-020', nombreCompleto: 'Fernanda López Sánchez',     grado: '6to Primaria', seccion: 'B', fechaNacimiento: new Date('2012-01-14'), encargado: 'Beatriz Sánchez', telefono: '5555-1020', estado: EstadoEstudiante.INACTIVO },
  ]
  const estudiantes = await Promise.all(estudiantesData.map(e => prisma.estudiante.create({ data: e })))

  // ─── Cursos ────────────────────────────────────────────────────────────────
  const cursoMath = await prisma.curso.create({ data: {
    codigo: 'MAT-3A-2024', nombre: 'Matemáticas', grado: '3ro Primaria', seccion: 'A',
    docenteId: docente1.id, periodoId: periodo2.id, estado: EstadoCurso.ACTIVO,
  }})
  const cursoLang = await prisma.curso.create({ data: {
    codigo: 'CYL-3A-2024', nombre: 'Comunicación y Lenguaje', grado: '3ro Primaria', seccion: 'A',
    docenteId: docente2.id, periodoId: periodo2.id, estado: EstadoCurso.ACTIVO,
  }})
  const cursoSci = await prisma.curso.create({ data: {
    codigo: 'CNT-4A-2024', nombre: 'Ciencias Naturales', grado: '4to Primaria', seccion: 'A',
    docenteId: docente3.id, periodoId: periodo2.id, estado: EstadoCurso.ACTIVO,
  }})
  const cursoSoc = await prisma.curso.create({ data: {
    codigo: 'CSO-4A-2024', nombre: 'Ciencias Sociales', grado: '4to Primaria', seccion: 'A',
    docenteId: docente1.id, periodoId: periodo2.id, estado: EstadoCurso.ACTIVO,
  }})
  const cursoComp = await prisma.curso.create({ data: {
    codigo: 'COM-5A-2024', nombre: 'Computación', grado: '5to Primaria', seccion: 'A',
    docenteId: docente2.id, periodoId: periodo2.id, estado: EstadoCurso.ACTIVO,
  }})

  // ─── Matrícula ─────────────────────────────────────────────────────────────
  // 3ro A → MAT y CYL (est 0-3)
  const est3A = estudiantes.slice(0, 4)
  // 4to A → CNT y CSO (est 5-8)
  const est4A = estudiantes.slice(5, 9)
  // 5to A → COM (est 10-12)
  const est5A = estudiantes.slice(10, 13)

  for (const e of est3A) {
    await prisma.matricula.createMany({ data: [
      { estudianteId: e.id, cursoId: cursoMath.id, periodoId: periodo2.id },
      { estudianteId: e.id, cursoId: cursoLang.id, periodoId: periodo2.id },
    ], skipDuplicates: true })
  }
  for (const e of est4A) {
    await prisma.matricula.createMany({ data: [
      { estudianteId: e.id, cursoId: cursoSci.id, periodoId: periodo2.id },
      { estudianteId: e.id, cursoId: cursoSoc.id, periodoId: periodo2.id },
    ], skipDuplicates: true })
  }
  for (const e of est5A) {
    await prisma.matricula.createMany({ data: [
      { estudianteId: e.id, cursoId: cursoComp.id, periodoId: periodo2.id },
    ], skipDuplicates: true })
  }

  // ─── Actividades ───────────────────────────────────────────────────────────
  const act1 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoMath.id, periodoId: periodo2.id,
    nombre: 'Tarea de Números Enteros', tipo: TipoActividad.TAREA,
    fecha: new Date('2024-03-25'), ponderacion: 30,
    descripcion: 'Ejercicios de suma, resta y multiplicación de números enteros',
  }})
  const act2 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoMath.id, periodoId: periodo2.id,
    nombre: 'Examen de Fracciones', tipo: TipoActividad.EXAMEN,
    fecha: new Date('2024-04-10'), ponderacion: 40,
    descripcion: 'Evaluación sumativa de fracciones propias e impropias',
  }})
  const act3 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoMath.id, periodoId: periodo2.id,
    nombre: 'Proyecto de Geometría', tipo: TipoActividad.PROYECTO,
    fecha: new Date('2024-04-30'), ponderacion: 30,
    descripcion: 'Maqueta de figuras geométricas en 3D',
  }})
  const act4 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoLang.id, periodoId: periodo2.id,
    nombre: 'Lectura Comprensiva', tipo: TipoActividad.TAREA,
    fecha: new Date('2024-03-22'), ponderacion: 25,
    descripcion: 'Análisis de texto narrativo',
  }})
  const act5 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoLang.id, periodoId: periodo2.id,
    nombre: 'Examen de Gramática', tipo: TipoActividad.EXAMEN,
    fecha: new Date('2024-04-08'), ponderacion: 50,
    descripcion: 'Evaluación de morfología y sintaxis',
  }})
  const act6 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoLang.id, periodoId: periodo2.id,
    nombre: 'Redacción Creativa', tipo: TipoActividad.PROYECTO,
    fecha: new Date('2024-04-25'), ponderacion: 25,
    descripcion: 'Creación de cuento corto original',
  }})
  const act7 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoSci.id, periodoId: periodo2.id,
    nombre: 'Laboratorio de Biología', tipo: TipoActividad.LABORATORIO,
    fecha: new Date('2024-03-28'), ponderacion: 40,
    descripcion: 'Observación de células bajo microscopio',
  }})
  const act8 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoSci.id, periodoId: periodo2.id,
    nombre: 'Examen de Ecosistemas', tipo: TipoActividad.EXAMEN,
    fecha: new Date('2024-04-15'), ponderacion: 60,
    descripcion: 'Evaluación de biomas y cadenas alimenticias',
  }})
  const act9 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoSoc.id, periodoId: periodo2.id,
    nombre: 'Participación en Clase', tipo: TipoActividad.PARTICIPACION,
    fecha: new Date('2024-04-05'), ponderacion: 30,
    descripcion: 'Evaluación continua de participación oral',
  }})
  const act10 = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoSoc.id, periodoId: periodo2.id,
    nombre: 'Examen de Historia Guatemala', tipo: TipoActividad.EXAMEN,
    fecha: new Date('2024-04-20'), ponderacion: 70,
    descripcion: 'Historia colonial y período independiente',
  }})

  // ─── Notas ─────────────────────────────────────────────────────────────────
  const notasData: { estudianteId: string; actividadId: string; valor: number }[] = []
  const notasMat = [
    [85, 78, 92, 95], // act1
    [72, 65, 88, 90], // act2
    [80, 70, 95, 88], // act3
  ]
  const notasLang = [
    [90, 85, 78, 92], // act4
    [75, 68, 82, 88], // act5
    [88, 72, 85, 94], // act6
  ]
  const notasSci = [
    [78, 55, 82, 90], // act7
    [70, 48, 75, 85], // act8
  ]
  const notasSoc = [
    [95, 88, 72, 60], // act9
    [82, 65, 70, 55], // act10
  ]

  const actsConEstudiantes = [
    { acts: [act1, act2, act3], notas: notasMat, estudiantes: est3A },
    { acts: [act4, act5, act6], notas: notasLang, estudiantes: est3A },
    { acts: [act7, act8],       notas: notasSci,  estudiantes: est4A },
    { acts: [act9, act10],      notas: notasSoc,  estudiantes: est4A },
  ]

  for (const { acts, notas, estudiantes: ests } of actsConEstudiantes) {
    for (let i = 0; i < acts.length; i++) {
      for (let j = 0; j < ests.length; j++) {
        notasData.push({
          estudianteId: ests[j].id,
          actividadId:  acts[i].id,
          valor:        notas[i][j],
        })
      }
    }
  }

  // Notas de Computación para 5to
  const notasComp = [78, 85, 92]
  for (let j = 0; j < est5A.length; j++) {
    // Solo act10 tiene 5to, usamos act7 como ejemplo de comp sin actividad, creo una dummy
  }
  // Crear actividad para comp y notas
  const actComp = await prisma.actividadEvaluativa.create({ data: {
    cursoId: cursoComp.id, periodoId: periodo2.id,
    nombre: 'Proyecto de Programación', tipo: TipoActividad.PROYECTO,
    fecha: new Date('2024-04-18'), ponderacion: 100,
    descripcion: 'Desarrollo de aplicación web básica en HTML/CSS',
  }})
  for (let j = 0; j < est5A.length; j++) {
    notasData.push({ estudianteId: est5A[j].id, actividadId: actComp.id, valor: notasComp[j] })
  }

  await Promise.all(notasData.map(n =>
    prisma.nota.create({ data: { ...n, registradoPorId: docente1.id } })
  ))

  // ─── Auditoría inicial ─────────────────────────────────────────────────────
  const auditorias = [
    { usuarioId: admin.id,      accion: 'INICIO_SESION',       modulo: 'AUTH',        detalle: 'Inicio de sesión exitoso' },
    { usuarioId: secretaria.id, accion: 'CREAR_ESTUDIANTE',    modulo: 'ESTUDIANTES', detalle: 'Se registró estudiante EST-001' },
    { usuarioId: secretaria.id, accion: 'CREAR_ESTUDIANTE',    modulo: 'ESTUDIANTES', detalle: 'Se registró estudiante EST-002' },
    { usuarioId: docente1.id,   accion: 'REGISTRAR_NOTA',      modulo: 'NOTAS',       detalle: 'Notas registradas en MAT-3A-2024' },
    { usuarioId: admin.id,      accion: 'CREAR_PERIODO',       modulo: 'PERIODOS',    detalle: 'Creado Primer Bimestre 2024' },
    { usuarioId: admin.id,      accion: 'CERRAR_PERIODO',      modulo: 'PERIODOS',    detalle: 'Cerrado Primer Bimestre 2024' },
    { usuarioId: docente2.id,   accion: 'CREAR_ACTIVIDAD',     modulo: 'ACTIVIDADES', detalle: 'Actividad: Examen de Gramática' },
    { usuarioId: secretaria.id, accion: 'GENERAR_BOLETIN',     modulo: 'BOLETINES',   detalle: 'Boletín generado para EST-001' },
    { usuarioId: director.id,   accion: 'CONSULTAR_REPORTE',   modulo: 'REPORTES',    detalle: 'Reporte de rendimiento por curso' },
    { usuarioId: admin.id,      accion: 'CREAR_USUARIO',       modulo: 'USUARIOS',    detalle: 'Usuario docente2@cejumeva.edu.gt creado' },
    { usuarioId: docente1.id,   accion: 'EDITAR_NOTA',         modulo: 'NOTAS',       detalle: 'Nota editada: EST-002 en MAT-3A' },
    { usuarioId: admin.id,      accion: 'CAMBIAR_ROL',         modulo: 'USUARIOS',    detalle: 'Rol actualizado para docente3@cejumeva.edu.gt' },
    { usuarioId: secretaria.id, accion: 'EDITAR_ESTUDIANTE',   modulo: 'ESTUDIANTES', detalle: 'Datos actualizados: EST-007' },
    { usuarioId: director.id,   accion: 'INICIO_SESION',       modulo: 'AUTH',        detalle: 'Inicio de sesión exitoso' },
    { usuarioId: docente3.id,   accion: 'REGISTRAR_NOTA',      modulo: 'NOTAS',       detalle: 'Notas registradas en CNT-4A-2024' },
  ]
  await Promise.all(auditorias.map(a => prisma.auditoria.create({ data: a })))

  console.log('✅ Seed completado exitosamente!')
  console.log(`   ✓ ${6} usuarios creados`)
  console.log(`   ✓ ${estudiantesData.length} estudiantes creados`)
  console.log(`   ✓ ${5} cursos creados`)
  console.log(`   ✓ ${2} periodos creados`)
  console.log(`   ✓ ${11} actividades creadas`)
  console.log(`   ✓ ${notasData.length} notas registradas`)
  console.log(`   ✓ ${auditorias.length} eventos de auditoría`)
}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
