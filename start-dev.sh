#!/bin/bash
# =============================================================================
# Script de inicio para desarrollo local de Joinly
# =============================================================================

set -e

echo "🚀 Iniciando entorno de desarrollo Joinly..."

# Verificar que existe .env
if [ ! -f .env ]; then
    echo "❌ Error: No existe el archivo .env"
    echo "➡️  Ejecuta: cp .env.example .env"
    echo "➡️  Luego edita .env con tus valores reales"
    exit 1
fi

# Cargar variables de entorno
export $(grep -v '^#' .env | xargs)

# Levantar MySQL con Docker
echo "📦 Iniciando MySQL con Docker Compose..."
docker-compose up -d

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté disponible..."
until docker exec joinly-mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} --silent 2>/dev/null; do
    printf '.'
    sleep 2
done
echo ""
echo "✅ MySQL está listo"

# Iniciar backend
echo "🔧 Iniciando backend Spring Boot..."
cd backend
./mvnw spring-boot:run
