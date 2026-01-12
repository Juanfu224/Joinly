# =============================================================================
# Joinly - Makefile
# =============================================================================
# Un solo comando: make start
# =============================================================================

.PHONY: help start stop status test clean init

GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
RED    := \033[0;31m
NC     := \033[0m

# Cargar variables de .env si existe
-include .env
export

help: ## 📖 Mostrar ayuda
	@echo ""
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║                      🚀 JOINLY                              ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-12s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Después de clonar:$(NC)  make init && make start"
	@echo ""

init: ## 🔧 Crear archivo .env desde .env.example
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✅ Archivo .env creado$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Archivo .env ya existe$(NC)"; \
	fi

start: ## ⭐ Iniciar TODO (MySQL + Backend + Frontend)
	@command -v java >/dev/null 2>&1 || { echo "$(RED)❌ Java no encontrado$(NC)"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)❌ Docker no encontrado$(NC)"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js no encontrado$(NC)"; exit 1; }
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ Archivo .env no encontrado. Ejecuta: make init$(NC)"; \
		exit 1; \
	fi
	@echo ""
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║                 🚀 Iniciando Joinly...                      ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@if ! docker ps --format '{{.Names}}' | grep -q "joinly-mysql"; then \
		echo "$(YELLOW)🐳 Iniciando MySQL...$(NC)"; \
		docker compose up -d 2>/dev/null; \
		echo "$(YELLOW)⏳ Esperando MySQL...$(NC)"; \
		until docker compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; do sleep 2; done; \
	fi
	@echo "$(GREEN)✅ MySQL listo$(NC)"
	@echo ""
	@echo "$(YELLOW)🚀 Iniciando Backend + Frontend...$(NC)"
	@echo "$(YELLOW)   Ctrl+C para detener todo$(NC)"
	@echo ""
	@echo "$(GREEN)   Backend:  http://localhost:8080$(NC)"
	@echo "$(GREEN)   Frontend: http://localhost:4200$(NC)"
	@echo ""
	@trap 'echo ""; echo "$(YELLOW)Deteniendo...$(NC)"; pkill -f "spring-boot:run" 2>/dev/null; pkill -f "ng serve" 2>/dev/null; pkill -f "esbuild" 2>/dev/null; echo "$(GREEN)✅ Detenido$(NC)"; exit 0' INT; \
	(cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev -q 2>&1 | sed 's/^/[backend] /') & \
	(sleep 5 && cd frontend && npm install --silent 2>/dev/null && npm start 2>&1 | sed 's/^/[frontend] /') & \
	wait

stop: ## 🛑 Detener servicios
	@echo "$(YELLOW)Deteniendo...$(NC)"
	@-pkill -f "spring-boot:run" 2>/dev/null || true
	@-pkill -f "ng serve" 2>/dev/null || true
	@-pkill -f "esbuild" 2>/dev/null || true
	@docker compose down 2>/dev/null || true
	@echo "$(GREEN)✅ Detenido$(NC)"

status: ## 📊 Estado de servicios
	@echo ""
	@curl -s http://localhost:8080/actuator/health >/dev/null 2>&1 && echo "$(GREEN)✅ Backend$(NC)  http://localhost:8080" || echo "$(RED)❌ Backend$(NC)"
	@curl -s http://localhost:4200 >/dev/null 2>&1 && echo "$(GREEN)✅ Frontend$(NC) http://localhost:4200" || echo "$(RED)❌ Frontend$(NC)"
	@docker ps --format '{{.Names}}' | grep -q "joinly-mysql" && echo "$(GREEN)✅ MySQL$(NC)    localhost:3306" || echo "$(RED)❌ MySQL$(NC)"
	@echo ""

test: ## 🧪 Ejecutar tests
	@cd backend && ./mvnw test

clean: ## 🧹 Limpiar todo
	@cd backend && ./mvnw clean -q 2>/dev/null || true
	@rm -rf frontend/dist frontend/.angular frontend/node_modules/.cache 2>/dev/null || true
	@docker compose down -v 2>/dev/null || true
	@echo "$(GREEN)✅ Limpio$(NC)"

.DEFAULT_GOAL := help
