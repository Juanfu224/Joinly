# =============================================================================
# Joinly - Makefile
# =============================================================================

.PHONY: help dev prod logs backup clean

COMPOSE_DEV = docker-compose.yml
COMPOSE_PROD = docker-compose.prod.yml

help: ## Mostrar ayuda
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

##@ Desarrollo
dev: ## Iniciar entorno de desarrollo
	docker compose -f $(COMPOSE_DEV) up -d
	@echo "✅ MySQL: localhost:3306"

dev-down: ## Detener desarrollo
	docker compose -f $(COMPOSE_DEV) down

##@ Producción
prod: ## Desplegar a producción
	@chmod +x scripts/*.sh
	./scripts/deploy.sh --build

prod-restart: ## Reiniciar producción
	docker compose -f $(COMPOSE_PROD) restart

prod-logs: ## Ver logs producción
	docker compose -f $(COMPOSE_PROD) logs -f

prod-status: ## Estado de servicios
	docker compose -f $(COMPOSE_PROD) ps
	@echo ""
	docker stats --no-stream $$(docker compose -f $(COMPOSE_PROD) ps -q) 2>/dev/null || true

prod-ssl: ## Configurar SSL Let's Encrypt
	./scripts/init-ssl.sh

##@ Base de Datos
backup: ## Crear backup
	./scripts/backup.sh

restore: ## Restaurar backup
	./scripts/restore.sh

##@ Testing
test: ## Ejecutar tests backend
	cd backend && ./mvnw test

##@ Limpieza
clean: ## Limpiar archivos generados
	cd backend && ./mvnw clean -q
	rm -rf frontend/dist frontend/.angular

clean-docker: ## Limpiar Docker
	docker system prune -f
