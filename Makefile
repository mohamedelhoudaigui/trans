# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mlamkadm <mlamkadm@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/03/08 14:45:36 by mlamkadm          #+#    #+#              #
#    Updated: 2025/05/17 19:55:00 by mlamkadm         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# ======================================================================================
# VARIABLES
# ======================================================================================
COMPOSE_FILE = docker-compose.yml
COMPOSE = docker-compose -f $(COMPOSE_FILE)

# ======================================================================================
# HELP TARGET
# ======================================================================================
.PHONY: help
help:
	@echo "Docker Compose Makefile Help"
	@echo "============================"
	@echo "Build:"
	@echo "  make build      - Build containers"
	@echo "  make no-cache   - Build containers without cache"
	@echo ""
	@echo "Runtime:"
	@echo "  make up         - Start containers in detached mode"
	@echo "  make down       - Stop containers"
	@echo "  make run        - Start containers and follow logs"
	@echo "  make restart    - Restart containers (down + up)"
	@echo "  make config     - Display docker-compose configuration"
	@echo ""
	@echo "Debug & Info:"
	@echo "  make logs       - Display container logs"
	@echo "  make it <container>           - Get interactive shell in container"
	@echo "  make exec <container> <cmd>   - Execute command in container"
	@echo "  make inspect <container>      - Inspect container details"
	@echo "  make ls         - List containers, volumes, and images"
	@echo ""
	@echo "Cleaning:"
	@echo "  make clean      - Remove containers and networks"
	@echo "  make fclean     - Remove containers, networks, volumes, and images"
	@echo "  make safe-prune - Safely prune dangling resources"
	@echo "  make re         - Rebuild and restart containers"
	@echo ""
	@echo "Examples:"
	@echo "  make it backend"
	@echo "  make exec backend ls -l"
	@echo "  make inspect backend"

# ======================================================================================
# DEFAULT TARGET
# ======================================================================================
.PHONY: all
all: build

# ======================================================================================
# BUILD TARGETS
# ======================================================================================
.PHONY: build rebuild no-cache
build:
	@echo "Building containers..."
	@$(COMPOSE) build

no-cache:
	@echo "Building containers with no-cache..."
	@$(COMPOSE) build --no-cache

# ======================================================================================
# RUNTIME TARGETS
# ======================================================================================
.PHONY: up down run restart config
up:
	@echo "Starting containers in detached mode..."
	@$(COMPOSE) up -d

down:
	@echo "Stopping containers..."
	@$(COMPOSE) down

run: up
	@echo "Following logs..."
	@$(COMPOSE) logs -f

restart: down up

config:
	@echo "Displaying configuration..."
	@$(COMPOSE) config

# ======================================================================================
# DEBUGGING & INFO TARGETS
# ======================================================================================
.PHONY: logs it exec inspect ls
logs:
	@echo "Displaying logs..."
	@$(COMPOSE) logs -f

# Interactive shell into container
# Usage: make it <container_name>
it:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Error: Container name required. Usage: make it <container_name>"; \
		exit 1; \
	fi; \
	container=$(filter-out $@,$(MAKECMDGOALS)); \
	$(COMPOSE) exec $$container /bin/bash || $(COMPOSE) exec $$container /bin/sh

# Execute command in container
# Usage: make exec <container_name> <command>
exec:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Error: Container name and command required. Usage: make exec <container_name> <command>"; \
		exit 1; \
	fi; \
	container=$(word 2, $(MAKECMDGOALS)); \
	cmd=$(wordlist 3, $(words $(MAKECMDGOALS)), $(MAKECMDGOALS)); \
	$(COMPOSE) exec $$container $$cmd

# Inspect container
# Usage: make inspect <container_name>
inspect:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Error: Container name required. Usage: make inspect <container_name>"; \
		exit 1; \
	fi; \
	container=$(filter-out $@,$(MAKECMDGOALS)); \
	docker inspect $$container

# List containers, volumes, and images related to this compose project
ls:
	@echo "===========[ Containers ]==========="
	@$(COMPOSE) ps
	@echo "===========[ Volumes ]=============="
	@docker volume ls --filter name=$$(basename $$(pwd))
	@echo "===========[ Images ]==============="
	@$(COMPOSE) images

# ======================================================================================
# CLEANING TARGETS - SAFE FOR HOMELAB AND LOCAL DEPLOYMENT
# ======================================================================================
.PHONY: clean fclean safe-prune

# Only remove containers, volumes and networks created by THIS compose file
clean:
	@echo "Removing containers and networks created by this docker-compose.yml..."
	@$(COMPOSE) down --remove-orphans

# More thorough cleanup but still only affecting THIS compose project
fclean:
	@echo "Removing containers, networks, volumes and images created by this docker-compose.yml..."
	@$(COMPOSE) down --volumes --remove-orphans --rmi local

# Safe pruning - only removes dangling images and volumes not used by any container (use in dev env or local build)
safe-prune:
	@echo "Safely pruning dangling resources..."
	@docker image prune -f
	@docker volume prune -f --filter "label!=keep"

# ======================================================================================
# REBUILD TARGET
# ======================================================================================
.PHONY: re
re: down build up

# Catch-all target to allow for container names with exec and it targets
%:
	@:

# Default target - shows help
.DEFAULT_GOAL := help

