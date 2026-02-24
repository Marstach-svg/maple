.PHONY: help build dev stop logs clean db-migrate db-studio check env

# Default target
help:
	@echo "Maple Travel Log - Available Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make build        - Build all Docker images"
	@echo "  make setup        - First-time setup (build + db migrate)"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start all services (db + backend + frontend)"
	@echo "  make stop         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - Tail logs from all services"
	@echo "  make logs-be      - Tail backend logs only"
	@echo "  make logs-fe      - Tail frontend logs only"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate   - Run Prisma migrations inside backend container"
	@echo "  make db-push      - Push Prisma schema (dev only)"
	@echo "  make db-studio    - Open Prisma Studio"
	@echo "  make db-reset     - Reset database (destructive)"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell-be     - Open shell in backend container"
	@echo "  make shell-fe     - Open shell in frontend container"
	@echo "  make check        - Check service health"
	@echo "  make env          - Show environment info"
	@echo "  make clean        - Remove containers, volumes, and build artifacts"

# Build Docker images
build:
	@echo "Building Docker images..."
	docker compose build

# First-time setup
setup: build
	@echo "Starting database..."
	docker compose up -d postgres
	@echo "Waiting for database to be ready..."
	docker compose run --rm backend npx prisma migrate deploy
	@echo "Setup complete! Run 'make dev' to start."

# Start all services
dev:
	@echo "Starting all services..."
	docker compose up

# Start in background
start:
	@echo "Starting all services in background..."
	docker compose up -d
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3001"

# Stop all services
stop:
	@echo "Stopping all services..."
	docker compose down

# Restart
restart: stop start

# Logs
logs:
	docker compose logs -f

logs-be:
	docker compose logs -f backend

logs-fe:
	docker compose logs -f frontend

# Database commands (run inside backend container)
db-migrate:
	@echo "Running Prisma migrations..."
	docker compose exec backend npx prisma migrate deploy

db-push:
	@echo "Pushing Prisma schema..."
	docker compose exec backend npx prisma db push

db-studio:
	@echo "Opening Prisma Studio (http://localhost:5555)..."
	docker compose exec -e BROWSER=none backend npx prisma studio

db-reset:
	@echo "Resetting database (this will delete all data)..."
	docker compose exec backend npx prisma migrate reset --force

# Shells
shell-be:
	docker compose exec backend sh

shell-fe:
	docker compose exec frontend sh

# Health check
check:
	@echo "Service status:"
	@echo "Frontend (http://localhost:3000):"
	@curl -sf http://localhost:3000 >/dev/null && echo "  Running" || echo "  Not running"
	@echo "Backend (http://localhost:3001/health):"
	@curl -sf http://localhost:3001/health >/dev/null && echo "  Running" || echo "  Not running"
	@echo "Containers:"
	@docker compose ps

# Environment info
env:
	@echo "Node.js: $(shell node --version 2>/dev/null || echo 'not installed locally')"
	@echo "Docker: $(shell docker --version | cut -d' ' -f3 | cut -d',' -f1)"
	@echo "Project: $(shell pwd)"
	@if [ -f .env ]; then \
		echo ".env: exists"; \
	else \
		echo ".env: missing - copy from .env.example"; \
	fi

# Clean up
clean:
	@echo "Removing containers, volumes, and build artifacts..."
	docker compose down -v
	-rm -rf apps/frontend/.next
	-rm -rf apps/backend/dist
	@echo "Done."
