# CEJUMEVA Academico

Sistema web de gestion academica escolar.

## Inicio Rapido

```bash
# Entrar al proyecto
cd cejumeva

# Levantar frontend, backend y base de datos local
docker compose up --build
```

Luego abrir:

```txt
http://localhost:5173
```

## Usuarios De Prueba

Estos usuarios existen cuando se carga el seed local con `RUN_SEED=true`.

| Rol | Correo | Contrasena |
|---|---|---|
| Administrador | admin@cejumeva.edu.gt | 123456 |
| Director | director@cejumeva.edu.gt | 123456 |
| Docente | docente@cejumeva.edu.gt | 123456 |
| Secretaria | secretaria@cejumeva.edu.gt | 123456 |

## Modulos Del Sistema

| Modulo | Descripcion | Roles |
|---|---|---|
| Dashboard | KPIs, graficos y accesos rapidos | Todos |
| Estudiantes | CRUD completo de estudiantes | Admin, Secretaria |
| Cursos | Gestion de cursos y asignacion docente | Admin, Docente |
| Periodos | Periodos academicos, abrir y cerrar | Admin |
| Actividades | Actividades evaluativas por curso | Docente |
| Notas | Registro y edicion de calificaciones | Docente |
| Boletines | Generacion e impresion de boletines | Segun permisos |
| Historial | Historial academico por estudiante | Todos |
| Reportes | Reportes con graficos y filtros | Director, Admin |
| Usuarios | Gestion de usuarios y roles | Admin |
| Auditoria | Log de eventos del sistema | Admin |
| Configuracion | Parametros institucionales | Admin |

## Arquitectura

```txt
Frontend (React + Vite)  :5173
       -> HTTP/REST
Backend (Node + Express) :4000
       -> Prisma ORM
PostgreSQL 16            :5432
```

Prisma si se usa actualmente. El backend lo usa para:

- definir el modelo de datos en `backend/prisma/schema.prisma`
- ejecutar migraciones con `npx prisma migrate deploy`
- consultar PostgreSQL desde los controladores del backend
- cargar datos de prueba con `backend/prisma/seed.ts`

## Tecnologias

Frontend: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Zustand, React Hook Form, Zod y Lucide React.

Backend: Node.js 20, Express, Prisma ORM, JWT, bcrypt y Zod.

Base de datos: PostgreSQL 16.

Infraestructura local: Docker y Docker Compose.

## Estructura Del Proyecto

```txt
cejumeva/
|-- docker-compose.yml
|-- README.md
|-- backend/
|   |-- Dockerfile
|   |-- package.json
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   `-- src/
|       |-- index.ts
|       |-- routes/
|       |-- controllers/
|       |-- middlewares/
|       `-- utils/
`-- frontend/
    |-- Dockerfile
    |-- package.json
    `-- src/
        |-- components/
        |-- pages/
        |-- services/
        |-- store/
        `-- types/
```

## Reglas Del Sistema

- Nota minima aprobatoria: 60.
- Promedio mayor o igual a 70: aprobado.
- Promedio entre 60 y 69: en riesgo.
- Promedio menor a 60: reprobado.
- Las notas solo se registran en periodos abiertos.
- La suma de ponderaciones por curso no puede exceder 100%.

## Comandos Utiles

```bash
# Ver logs del backend
docker compose logs backend -f

# Resetear base de datos local
docker compose exec backend npx prisma migrate reset --force

# Ver base de datos local
docker compose exec db psql -U cejumeva_user -d cejumeva
```

## Despliegue

El destino final de despliegue todavia no esta cerrado. Por ahora el proyecto esta preparado para dos escenarios:

- Local con Docker: usa `docker compose up --build` y carga datos de prueba porque `RUN_SEED=true`.
- Pruebas en servicios cloud: usa variables de entorno reales y debe dejar `RUN_SEED=false` para no borrar datos.

Cuando se decida VPS, la configuracion recomendada sera correr frontend, backend, PostgreSQL y proxy HTTPS con Docker Compose.

Variables del backend:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=change_this_to_a_long_random_secret
PORT=4000
NODE_ENV=production
RUN_SEED=false
```

Variables del frontend:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Comandos sugeridos para backend:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Comandos sugeridos para frontend:

```bash
npm install
npm run build
```
