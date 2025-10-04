SSL_SCRIPT := tools/ssl_generator.sh #TODO: I'm working on this @kmoraga
DC := docker-compose
PROJECT := backend/nginx
COMPOSE_ALL := docker-compose -f docker-compose.yml -f devops/elk/compose.elk.yml

.PHONY: all up down rebuild clean show-url up-all


all: up show-url

show-url:
	@echo "🌐 Access the website at:"
	@echo "http://$$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $$2}'):8080"
	@echo "or http://localhost:8080"
#ssl:
#	@echo "🔐 Generating SSL certificates..."
#	@bash $(SSL_SCRIPT)

up:
	@echo "🚀 Starting containers..."
	@$(DC) up -d > /dev/null 2>&1
	@echo "✅ Containers are up and running."

up-all: show-url
	@echo "🚀 Starting all containers including ELK stack..."
	@$(COMPOSE_ALL) up -d > /dev/null 2>&1
	@echo "✅ All containers are up and running."

down: 
	@echo "🛑 Stopping containers..."
	@$(COMPOSE_ALL) down
	@docker system prune -f	
	@echo "✅ Containers have been stopped."

rebuild: down show-url
	@echo "🔄 Rebuilding images and starting containers..."
	@$(DC) up --build -d > /dev/null 2>&1
	@echo "✅ Containers are up and running."

clean: down
#	@echo "🧹 Removing SSL certificates..."
#	@rm -rf $(PROJECT)/ssl
	@echo "🧹 Removing Docker volumes..."
	@$(DC) down -v > /dev/null 2>&1
	@echo "✅ Cleanup complete."
