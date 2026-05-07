#!/bin/sh
set -e

echo "Base de datos disponible"

echo "Ejecutando migraciones..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Poblando base de datos con datos de prueba..."
  npx tsx prisma/seed.ts
else
  echo "Seed omitido. Define RUN_SEED=true para cargar datos de prueba."
fi

if [ "$NODE_ENV" = "production" ]; then
  echo "Compilando backend para producción..."
  npm run build
  echo "Iniciando servidor en producción..."
  exec npm start
fi

echo "Iniciando servidor en desarrollo..."
exec npm run dev
