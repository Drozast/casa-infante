.PHONY: setup dev stop clean db-seed logs help

# Variables
DC = docker compose

help: ## Mostrar ayuda
	@echo "Casa Infante - Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Configuración inicial (copiar .env y preparar entorno)
	@if [ ! -f .env ]; then cp .env.example .env; echo "✅ Archivo .env creado"; fi
	@cd backend && npm install
	@cd frontend && npm install
	@echo "✅ Dependencias instaladas"

dev-db: ## Iniciar solo bases de datos (PostgreSQL + Redis)
	$(DC) up -d postgres redis
	@echo "⏳ Esperando que PostgreSQL esté listo..."
	@sleep 5
	@echo "✅ Bases de datos listas"

dev: dev-db ## Iniciar entorno de desarrollo
	@echo "🚀 Iniciando backend y frontend..."
	@cd backend && npx prisma generate && npx prisma migrate dev &
	@cd backend && npm run start:dev &
	@cd frontend && npm run dev &
	@echo "✅ Backend: http://localhost:3031"
	@echo "✅ Frontend: http://localhost:3000"
	@echo "✅ Swagger API: http://localhost:3031/api"

prod: ## Iniciar todos los servicios en producción
	$(DC) up -d --build
	@echo "✅ Todos los servicios iniciados"
	@echo "📌 Frontend: http://localhost:3030"
	@echo "📌 Backend API: http://localhost:3031"
	@echo "📌 MinIO Console: http://localhost:9021"

stop: ## Detener todos los servicios
	$(DC) down
	@echo "✅ Servicios detenidos"

clean: ## Limpiar todo (contenedores, volúmenes, node_modules)
	$(DC) down -v --rmi local
	rm -rf backend/node_modules frontend/node_modules
	rm -rf backend/dist frontend/.next
	@echo "✅ Limpieza completada"

db-seed: ## Ejecutar seed de base de datos
	@cd backend && npx prisma db seed
	@echo "✅ Seed ejecutado"

db-reset: ## Resetear base de datos (cuidado: elimina todos los datos)
	@cd backend && npx prisma migrate reset --force
	@echo "✅ Base de datos reseteada"

db-migrate: ## Ejecutar migraciones pendientes
	@cd backend && npx prisma migrate dev
	@echo "✅ Migraciones ejecutadas"

db-studio: ## Abrir Prisma Studio
	@cd backend && npx prisma studio

logs: ## Ver logs de todos los servicios
	$(DC) logs -f

logs-backend: ## Ver logs del backend
	$(DC) logs -f backend

logs-frontend: ## Ver logs del frontend
	$(DC) logs -f frontend

test: ## Ejecutar tests del backend
	@cd backend && npm run test

test-e2e: ## Ejecutar tests e2e
	@cd backend && npm run test:e2e

lint: ## Ejecutar linter
	@cd backend && npm run lint
	@cd frontend && npm run lint

build: ## Build de producción
	@cd backend && npm run build
	@cd frontend && npm run build
	@echo "✅ Build completado"
