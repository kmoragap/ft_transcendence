SSL_SCRIPT := tools/ssl_generator.sh
PROJECT := backend/nginx
COMPOSE_ALL := docker-compose -f docker-compose.yml -f devops/elk/compose.elk.yml
SSL := backend/nginx

.PHONY: all up down rebuild clean show-url rebuild_game


all: ssl up show-url

show-url:
	@echo "Access the website at:"
	@echo "https://$$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $$2}')"
	@echo "or https://localhost:8080"
ssl:
	@echo "Generating SSL certificates..."
	@bash $(SSL_SCRIPT)

up:
	@echo "🚀 Starting containers..."
	@$(COMPOSE_ALL) up -d > /dev/null 2>&1
	@echo "✅ Containers are up and running."

down:
	@echo "🛑 Stopping containers..."
	@$(COMPOSE_ALL) down
	@docker system prune -f
	@echo "Containers have been stopped."

rebuild: down ssl show-url
	@echo "🔄 Rebuilding images and starting containers..."
	@$(COMPOSE_ALL) up --build -d > /dev/null 2>&1
	@echo "✅ Containers are up and running."

clean: down
	@echo "Removing SSL certificates..."
	@rm -rf $(SSL)/ssl
	@echo "Removing Docker images..."
	@docker image rm $(shell docker images -q)
	@echo "🧹 Removing Docker volumes..."
	@$(COMPOSE_ALL) down -v > /dev/null 2>&1
	@docker volume ls -q | xargs -r docker volume rm
	@echo "✅ Cleanup complete."

rebuild_game: down
	@docker image rm ft_transcendence-pong:latest
	@docker volume rm ft_transcendence_pong-static
	@$(COMPOSE_ALL) up -d > /dev/null 2>&1

