# 🌿 Oasis Deep Cleanup Script
# Ejecuta este script para limpiar archivos temporales y consolidar la base de datos.

Write-Host "🧹 Iniciando limpieza profunda de Oasis..." -ForegroundColor Cyan

# 1. Consolidar Base de Datos Backend
if (Test-Path "Backend/prisma/prisma/dev.db") {
    Write-Host "📦 Consolidando DB del Backend..."
    Move-Item -Path "Backend/prisma/prisma/dev.db" -Destination "Backend/prisma/dev.db" -Force
    Remove-Item -Path "Backend/prisma/prisma" -Recurse -Force
}

# 2. Consolidar Base de Datos Frontend
if (Test-Path "Frontend/prisma/prisma/dev.db") {
    Write-Host "📦 Consolidando DB del Frontend..."
    Move-Item -Path "Frontend/prisma/prisma/dev.db" -Destination "Frontend/prisma/dev.db" -Force
    Remove-Item -Path "Frontend/prisma/prisma" -Recurse -Force
}

# 3. Eliminar APIs internas del Frontend (Ahora usa el Backend en 3001)
if (Test-Path "Frontend/src/app/api") {
    Write-Host "🗑️ Eliminando APIs duplicadas del Frontend..."
    Remove-Item -Path "Frontend/src/app/api" -Recurse -Force
}

# 4. Eliminar archivos de scratch/debug
if (Test-Path "Backend/scratch") {
    Write-Host "🗑️ Eliminando archivos de depuración (scratch)..."
    Remove-Item -Path "Backend/scratch" -Recurse -Force
}

# 5. Limpiar caché de Next.js
Write-Host "🧹 Limpiando caché de compilación..."
if (Test-Path "Frontend/.next") { Remove-Item -Path "Frontend/.next" -Recurse -Force }
if (Test-Path "Backend/.next") { Remove-Item -Path "Backend/.next" -Recurse -Force }

Write-Host "✅ Limpieza completada. El proyecto está estandarizado." -ForegroundColor Green
Write-Host "💡 Próximo paso: Ejecuta 'npm run dev' en ambas carpetas."
