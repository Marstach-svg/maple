.PHONY: help install setup dev start stop clean logs db-reset db-studio

# Default target
help:
	@echo "🍁 Maple Travel Log - Available Commands"
	@echo ""
	@echo "📦 Setup Commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make setup      - Complete setup (install + db setup)"
	@echo ""
	@echo "🚀 Development Commands:"
	@echo "  make dev        - Start all services (frontend + backend + db)"
	@echo "  make start      - Start all services in background"
	@echo "  make stop       - Stop all services"
	@echo ""
	@echo "🗄️ Database Commands:"
	@echo "  make db-up      - Start PostgreSQL container"
	@echo "  make db-down    - Stop PostgreSQL container"
	@echo "  make db-reset   - Reset database (drop + recreate)"
	@echo "  make db-studio  - Open Prisma Studio"
	@echo ""
	@echo "🔍 Utility Commands:"
	@echo "  make logs       - Show service logs"
	@echo "  make clean      - Clean build artifacts and containers"
	@echo "  make check      - Check service status"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Complete setup
setup: install db-up
	@echo "⚡ Setting up database..."
	sleep 5
	npm run db:generate
	npm run db:push
	@echo "✅ Setup complete! Run 'make dev' to start development"

# Start all services
dev: db-up
	@echo "🚀 Starting all services..."
	sleep 3
	npm run dev

# Start services in background
start: db-up
	@echo "🚀 Starting all services in background..."
	sleep 3
	npm run dev > dev.log 2>&1 &
	@echo "✅ Services started in background"
	@echo "📝 Logs: tail -f dev.log"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔗 Backend: http://localhost:3001"

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	-pkill -f "next dev"
	-pkill -f "tsx watch"
	-pkill -f "npm run dev"
	docker-compose down
	@echo "✅ All services stopped"

# Database commands
db-up:
	@echo "🗄️ Starting PostgreSQL..."
	docker-compose up -d postgres
	@echo "⏳ Waiting for database to be ready..."
	sleep 5

db-down:
	@echo "🗄️ Stopping PostgreSQL..."
	docker-compose down

db-reset: db-down db-up
	@echo "🔄 Resetting database..."
	sleep 5
	npm run db:push
	@echo "✅ Database reset complete"

db-studio:
	@echo "🎛️ Opening Prisma Studio..."
	npm run db:studio

# Show logs
logs:
	@echo "📋 Service Status:"
	@echo "Frontend (Next.js):"
	@curl -s http://localhost:3000 >/dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo "Backend (Hono API):"
	@curl -s http://localhost:3001/health >/dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo "Database (PostgreSQL):"
	@docker-compose ps postgres | grep -q "Up" && echo "  ✅ Running" || echo "  ❌ Not running"
	@echo ""
	@if [ -f dev.log ]; then \
		echo "📝 Recent logs:"; \
		tail -20 dev.log; \
	else \
		echo "📝 No log file found. Services running in foreground?"; \
	fi

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	-pkill -f "next dev"
	-pkill -f "tsx watch"
	-pkill -f "npm run dev"
	docker-compose down -v
	-rm -f dev.log
	-rm -rf node_modules/.cache
	-rm -rf apps/frontend/.next
	-rm -rf apps/backend/dist
	@echo "✅ Cleanup complete"

# Check service status
check:
	@echo "🔍 Checking service status..."
	@echo "Frontend: http://localhost:3000"
	@curl -s http://localhost:3000 >/dev/null && echo "  ✅ Accessible" || echo "  ❌ Not accessible"
	@echo "Backend: http://localhost:3001"
	@curl -s http://localhost:3001/health >/dev/null && echo "  ✅ Accessible" || echo "  ❌ Not accessible"
	@echo "Database:"
	@docker-compose ps postgres | grep -q "Up" && echo "  ✅ Container running" || echo "  ❌ Container not running"

# Development shortcuts
frontend:
	@echo "🎨 Starting frontend only..."
	cd apps/frontend && npm run dev

backend:
	@echo "⚙️ Starting backend only..."
	cd apps/backend && npm run dev

# Quick restart
restart: stop start

# Show environment info
env:
	@echo "🌍 Environment Information:"
	@echo "Node.js: $(shell node --version)"
	@echo "NPM: $(shell npm --version)"
	@echo "Docker: $(shell docker --version | cut -d' ' -f3 | cut -d',' -f1)"
	@echo "Project: $(shell pwd)"
	@echo ""
	@echo "📝 Environment file:"
	@if [ -f .env ]; then \
		echo "  ✅ .env exists"; \
		echo "  📧 ALLOWED_EMAILS: $(shell grep ALLOWED_EMAILS .env | cut -d'=' -f2)"; \
	else \
		echo "  ❌ .env missing - copy from .env.example"; \
	fi