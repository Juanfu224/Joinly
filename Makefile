# =============================================================================
# Joinly - Makefile
# =============================================================================
# Comandos útiles para desarrollo y producción
# =============================================================================

.PHONY: help dev-up dev-down dev-logs prod-deploy prod-logs backup restore clean

# Variables
COMPOSE_DEV = docker-compose.yml
COMPOSE_PROD = docker-compose.prod.yml

##@ General

help: ## Mostrar ayuda
	@awk 'BEGIN {FS = ":.*##"; printf "\nUso:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Desarrollo

dev-up: ## Iniciar entorno de desarrollo
	@echo "🚀 Iniciando entorno de desarrollo..."
	docker compose -f $(COMPOSE_DEV) up -d
	@echo "✅ Base de datos iniciada en localhost:3306"
	@echo "💡 Backend: cd backend && ./mvnw spring-boot:run"
	@echo "💡 Frontend: cd frontend && npm start"

dev-down: ## Detener entorno de desarrollo
	@echo "🛑 Deteniendo entorno de desarrollo..."
	docker compose -f $(COMPOSE_DEV) down

dev-logs: ## Ver logs del entorno de desarrollo
	docker compose -f $(COMPOSE_DEV) logs -f

dev-clean: ## Limpiar entorno de desarrollo (ELIMINA DATOS)
	@echo "⚠️  ADVERTENCIA: Esto eliminará todos los datos de desarrollo"
	@read -p "¿Continuar? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose -f $(COMPOSE_DEV) down -v; \
		echo "✅ Entorno limpiado"; \
	fi

##@ Producción

prod-deploy: ## Desplegar a producción
	@echo "🚀 Desplegando a producción..."
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh --build

prod-restart: ## Reiniciar servicios de producción
	@echo "🔄 Reiniciando servicios..."
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh --restart

prod-logs: ## Ver logs de producción
	docker compose -f $(COMPOSE_PROD) logs -f

prod-status: ## Ver estado de servicios en producción
	docker compose -f $(COMPOSE_PROD) ps

prod-ssl: ## Configurar SSL para producción
	@echo "🔒 Configurando SSL..."
	@chmod +x scripts/init-ssl.sh
	@./scripts/init-ssl.sh

##@ Base de Datos

backup: ## Crear backup de base de datos
	@echo "💾 Creando backup..."
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh

restore: ## Restaurar backup de base de datos
	@echo "📥 Restaurando backup..."
	@chmod +x scripts/restore.sh
	@./scripts/restore.sh

db-shell: ## Conectar a MySQL en desarrollo
	docker compose -f $(COMPOSE_DEV) exec mysql mysql -u root -p

##@ Testing

test-backend: ## Ejecutar tests del backend
	@echo "🧪 Ejecutando tests del backend..."
	cd backend && ./mvnw test

test-backend-coverage: ## Tests con cobertura
	@echo "🧪 Ejecutando tests con cobertura..."
	cd backend && ./mvnw test jacoco:report
	@echo "📊 Reporte disponible en: backend/target/site/jacoco/index.html"

##@ Limpieza

clean: ## Limpiar archivos generados
	@echo "🧹 Limpiando archivos generados..."
	@cd backend && ./mvnw clean
	@cd frontend && rm -rf dist/ .angular/
	@echo "✅ Limpieza completada"

clean-docker: ## Limpiar recursos Docker no utilizados
	@echo "🧹 Limpiando recursos Docker..."
	docker system prune -f
	@echo "✅ Limpieza completada"

##@ Utilidades

permissions: ## Dar permisos de ejecución a scripts
	@echo "🔑 Configurando permisos..."
	@chmod +x scripts/*.sh
	@echo "✅ Permisos configurados"

env-check: ## Verificar variables de entorno
	@echo "🔍 Verificando configuración..."
	@if [ ! -f .env ]; then \
		echo "❌ Archivo .env no encontrado"; \
		echo "💡 Ejecuta: cp .env.example .env"; \
		exit 1; \
	fi
	@echo "✅ Archivo .env encontrado"
	@grep -q "GENERAR" .env && echo "⚠️  Hay variables sin configurar en .env" || echo "✅ Variables configuradas"

setup: permissions env-check ## Configuración inicial del proyecto
	@echo "⚙️  Configuración inicial completada"
	@echo "📝 Próximos pasos:"
	@echo "   1. Revisar y completar el archivo .env"
	@echo "   2. Ejecutar: make dev-up"
	@echo "   3. Iniciar backend: cd backend && ./mvnw spring-boot:run"
	@echo "   4. Iniciar frontend: cd frontend && npm start"
