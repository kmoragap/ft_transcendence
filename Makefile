SSL_SCRIPT := tools/ssl_generator.sh
DC := docker-compose
SSL := backend/nginx

.PHONY: all up down rebuild clean show-url


all: up show-url

show-url:
	@echo "🌐 Access the website at:"
	@echo "https://$$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $$2}')"
	@echo "or https://localhost"
ssl:
	@echo "🔐 Generating SSL certificates..."
	@bash $(SSL_SCRIPT)

up:
	@echo "🚀 Starting containers..."
	@$(DC) up -d > /dev/null 2>&1
	@echo "✅ Containers are up and running."

down:
	@echo "🛑 Stopping containers..."
	@$(DC) down
	@docker system prune -f
	@echo "✅ Containers have been stopped."

rebuild: down ssl show-url
	@echo "🔄 Rebuilding images and starting containers..."
	@$(DC) up --build -d > /dev/null 2>&1
	@echo "✅ Containers are up and running."

clean: down
	@echo "🧹 Removing SSL certificates..."
	@rm -rf $(SSL)/ssl/*
	@echo "🧹 Removing Docker images..."
	@docker image rm $(shell docker images -q)
	@echo "🧹 Removing Docker volumes..."
	@$(DC) down -v > /dev/null 2>&1
	@echo "✅ Cleanup complete."
