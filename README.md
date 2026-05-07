# CEJUMEVA Académico
## Sistema Web de Gestión Académica Escolar

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://postgresql.org)

---

## 🚀 Inicio Rápido

```bash
# Clonar y entrar al directorio
cd cejumeva

# Levantar todo con Docker
docker compose up --build
```

Luego abrir: **http://localhost:5173**

---

## 👤 Usuarios de Prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@cejumeva.edu.gt | 123456 |
| Director | director@cejumeva.edu.gt | 123456 |
| Docente | docente@cejumeva.edu.gt | 123456 |
| Secretaria | secretaria@cejumeva.edu.gt | 123456 |

---

## 📦 Módulos del Sistema

| Módulo | Descripción | Roles |
|---|---|---|
| Dashboard | KPIs, gráficos y accesos rápidos | Todos |
| Estudiantes | CRUD completo de estudiantes | Admin, Secretaria |
| Cursos | Gestión de cursos y asignación docente | Admin, Docente |
| Periodos | Periodos académicos (abrir/cerrar) | Admin |
| Actividades | Actividades evaluativas por curso | Docente |
| Notas | Registro y edición de calificaciones | Docente |
| Boletines | Generación e impresión de boletines | Todos |
| Historial | Historial académico por estudiante | Todos |
| Reportes | Reportes con gráficos y filtros | Director, Admin |
| Usuarios | Gestión de usuarios y roles | Admin |
| Auditoría | Log de eventos del sistema | Admin |
| Configuración | Parámetros institucionales | Admin |

---

## 🏗️ Arquitectura

```
Frontend (React+Vite)  :5173
       ↓ HTTP/REST
Backend (Node+Express) :4000
       ↓ Prisma ORM
PostgreSQL 16          :5432
```

---

## 🛠️ Tecnologías

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Zustand, React Hook Form + Zod, Lucide React

**Backend:** Node.js 20, Express, Prisma ORM, JWT, bcrypt, Zod

**Base de Datos:** PostgreSQL 16

**Infraestructura:** Docker, Docker Compose

---

## 📁 Estructura del Proyecto

```
cejumeva/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts
│       ├── routes/
│       ├── controllers/
│       ├── middlewares/
│       └── utils/
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── components/
        ├── pages/
        ├── routes/
        ├── services/
        ├── store/
        ├── types/
        └── utils/
```

---

## 📋 Reglas del Sistema

- Nota mínima aprobatoria: **60**
- Promedio ≥ 70 → **Aprobado** 🟢
- Promedio 60–69 → **En Riesgo** 🟡
- Promedio < 60 → **Reprobado** 🔴
- Las notas solo se registran en **periodos abiertos**
- La suma de ponderaciones por curso **no puede exceder 100%**

---

## 🔧 Comandos Útiles

```bash
# Ver logs del backend
docker compose logs backend -f

# Resetear base de datos
docker compose exec backend npx prisma migrate reset --force

# Ver base de datos
docker compose exec db psql -U cejumeva_user -d cejumeva
```

---

## Despliegue

El proyecto mantiene dos modos de trabajo:

- Local con Docker: usa `docker compose up --build` y carga datos de prueba porque `RUN_SEED=true`.
- Producción: usa variables de entorno reales y debe dejar `RUN_SEED=false` para no borrar datos.

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

Comandos sugeridos en producción para backend:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Comandos sugeridos en producción para frontend:

```bash
npm install
npm run build
```
