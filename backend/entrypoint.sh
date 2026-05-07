#!/bin/sh
set -e

echo "✅ Base de datos disponible gracias a depends_on"

echo "🗄️  Ejecutando migraciones..."
npx prisma migrate deploy

echo "🌱 Poblando base de datos con datos de prueba..."
npx tsx prisma/seed.ts

echo "🚀 Iniciando servidor..."
exec npm run dev
