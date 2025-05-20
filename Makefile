# ======================================================================================
# MISCELLANEOUS
# ======================================================================================

RED     := \033[0;31m
GREEN   := \033[0;32m
YELLOW  := \033[1;33m
BLUE    := \033[0;34m
NC      := \033[0m

# ======================================================================================
# GENERAL CONFIGURATION
# ======================================================================================

SHELL := /bin/bash

COMPOSE_FILE ?= docker-compose.yml
COMPOSE := docker-compose -f $(COMPOSE_FILE)

# ======================================================================================
# DEFAULT TARGET & SELF-DOCUMENTATION
# ======================================================================================
.DEFAULT_GOAL := help

# Phony targets -don't represent files
.PHONY: help up down logs ps build no-cache restart re config status clean fclean prune \
        stop start \
        ssh exec inspect list-volumes list-networks

# ======================================================================================
# HELP & USAGE
# ======================================================================================

help:
	@echo -e "$(BLUE)========================================================================="
	@echo -e " Lbro's Universal Docker Compose Makefile "
	@echo -e "=========================================================================$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Usage: make [target] [service=SERVICE_NAME] [args="ARGS"] [file=COMPOSE_FILE]$(NC)"
	@echo -e "  'service' specifies a single service for targets like logs, build, ssh, exec, inspect."
	@echo -e "  'args' specifies commands for 'exec'."
	@echo -e "  'file' specifies an alternative docker-compose file (default: docker-compose.yml)."
	@echo ""
	@echo -e "$(GREEN)Core Stack Management:$(NC)"
	@echo -e "  up                  - Start all services in detached mode (Alias: start)."
	@echo -e "  down                - Stop and remove all services and default network."
	@echo -e "  restart             - Restart all services (down + up)."
	@echo -e "  re                  - Rebuild images and restart all services (down + build + up)."
	@echo -e "  rere                - Rebuild images without cache and restart all services (down + no-cache + up)."
	@echo -e "  stop                - Stop all services without removing them."
	@echo ""
	@echo -e "$(GREEN)Building Images:$(NC)"
	@echo -e "  build [service=<name>] - Build images (all or specific service)."
	@echo -e "  no-cache [service=<name>] - Build images without cache (all or specific service)."
	@echo ""
	@echo -e "$(GREEN)Information & Debugging:$(NC)"
	@echo -e "  status [service=<name>] - Show status of services (all or specific) (Alias: ps)."
	@echo -e "  logs [service=<name>]   - Follow logs (all or specific service)."
	@echo -e "  config              - Validate and display effective Docker Compose configuration."
	@echo -e "  ssh service=<name>    - Get an interactive shell into a running service (Alias: it)."
	@echo -e "  exec service=<name> args=\"<cmd>\" - Execute a command in a running service."
	@echo -e "  inspect service=<name> - Inspect a running service container."
	@echo -e "  list-volumes        - List Docker volumes (may include non-project volumes)."
	@echo -e "  list-networks       - List Docker networks (may include non-project networks)."
	@echo ""
	@echo -e "$(GREEN)Cleaning & Pruning:$(NC)"
	@echo -e "  clean               - Remove stopped service containers and default network created by compose."
	@echo -e "  fclean              - Perform 'clean' and also remove volumes defined in compose file."
	@echo -e "  prune               - Prune unused Docker images, build cache, and dangling volumes (Docker system prune)."
	@echo ""
	@echo -e "$(YELLOW)Examples:$(NC)"
	@echo -e "  make up"
	@echo -e "  make logs service=my_backend"
	@echo -e "  make ssh service=my_app_container"
	@echo -e "  make build file=docker-compose.dev.yml"
	@echo -e "$(BLUE)========================================================================="
	@echo -e " Help Section End "
	@echo -e "=========================================================================$(NC)"

# ======================================================================================
# CORE STACK MANAGEMENT
# ======================================================================================

up: ## Start all services in detached mode
	@echo -e "$(GREEN)Igniting services from $(COMPOSE_FILE)... All systems GO!$(NC)"
	@$(COMPOSE) up -d --remove-orphans
	@echo -e "$(GREEN)Services are now running in detached mode.$(NC)"

down: ## Stop and remove all services and networks defined in the compose file
	@echo -e "$(RED)Shutting down services from $(COMPOSE_FILE)... Powering down.$(NC)"
	@$(COMPOSE) down --remove-orphans
stop: ## Stop all services without removing them
	@echo -e "$(YELLOW)Halting operations for $(COMPOSE_FILE)... Services stopping.$(NC)"
	@$(COMPOSE) stop $(service) # Can stop specific service if 'service' var is passed

restart: down up ## Restart all services

re: down build up ## Rebuild images and restart all services

rere: down no-cache up ## Rebuild images without cache and restart all services

# ======================================================================================
# BUILDING IMAGES
# ======================================================================================

build: ## Build (or rebuild) images for specified service, or all if none specified
	@echo -e "$(BLUE)Forging components... Building images for $(or $(service),all services) from $(COMPOSE_FILE).$(NC)"
	@$(COMPOSE) build $(service)

no-cache: ## Build images without using cache for specified service, or all
	@echo -e "$(YELLOW)Force-forging (no cache)... Building for $(or $(service),all services) from $(COMPOSE_FILE).$(NC)"
	@$(COMPOSE) build --no-cache $(service)

# ======================================================================================
# INFORMATION & DEBUGGING
# ======================================================================================

status: ## Show status of running services
	@echo -e "$(BLUE)System Status Report for $(COMPOSE_FILE):$(NC)"
	@$(COMPOSE) ps $(service)
ps: status ## Alias for status

logs: ## Follow logs for specified service, or all if none specified
	@echo -e "$(BLUE)Tapping into data stream... Logs for $(or $(service),all services) from $(COMPOSE_FILE).$(NC)"
	@$(COMPOSE) logs -f --tail="100" $(service)

config: ## Validate and display effective Docker Compose configuration
	@echo -e "$(BLUE)Blueprint Configuration for $(COMPOSE_FILE):$(NC)"
	@$(COMPOSE) config

ssh: ## Get an interactive shell into a running service container
	@if [ -z "$(service)" ]; then \
		echo -e "$(RED)Error: Service name required. Usage: make ssh service=<service_name>$(NC)"; \
		exit 1; \
	fi
	@echo -e "$(GREEN)Establishing DirectConnect to $(service) from $(COMPOSE_FILE)... Standby.$(NC)"
	@$(COMPOSE) exec $(service) /bin/sh || $(COMPOSE) exec $(service) /bin/bash || echo -e "$(RED)Failed to find /bin/sh or /bin/bash in $(service).$(NC)"
it: ssh ## Alias for ssh

exec: ## Execute a command in a running service container
	@if [ -z "$(service)" ] || [ -z "$(args)" ]; then \
		echo -e "$(RED)Error: Service name and command required. Usage: make exec service=<service_name> args=\"<command>\"$(NC)"; \
		exit 1; \
	fi
	@echo -e "$(GREEN)Executing remote directive in $(service) (from $(COMPOSE_FILE)): $(args)...$(NC)"
	@$(COMPOSE) exec $(service) $(args)

inspect: ## Inspect a running service container
	@if [ -z "$(service)" ]; then \
		echo -e "$(RED)Error: Service name required. Usage: make inspect service=<service_name>$(NC)"; \
		exit 1; \
	fi
	@echo -e "$(BLUE)Performing deep scan of $(service) (from $(COMPOSE_FILE)) internals...$(NC)"
	@_container_id=$$(docker-compose -f $(COMPOSE_FILE) ps -q $(service) | head -n 1); \
	if [ -z "$$_container_id" ]; then \
		echo -e "$(RED)Service $(service) not found or not running.$(NC)"; \
		exit 1; \
	fi; \
	docker inspect $$_container_id

list-volumes: ## List Docker volumes
	@echo -e "$(BLUE)Global Docker Volumes (use 'docker volume ls --filter label=com.docker.compose.project=YOUR_PROJECT_NAME' for project specifics):$(NC)"
	@docker volume ls
	@echo -e "$(YELLOW)Note: For project-specific volumes, Docker Compose adds labels based on project name (usually dir name).$(NC)"

list-networks: ## List Docker networks
	@echo -e "$(BLUE)Global Docker Networks (use 'docker network ls --filter label=com.docker.compose.project=YOUR_PROJECT_NAME' for project specifics):$(NC)"
	@docker network ls

# ======================================================================================
# CLEANING & PRUNING
# ======================================================================================

clean: ## Remove stopped service containers and default network created by this compose file
	@echo -e "$(YELLOW)Sanitizing workspace for $(COMPOSE_FILE)... Removing stopped containers and networks.$(NC)"
	@$(COMPOSE) down --remove-orphans --rmi 'none' # Keep images

fclean: ## Perform 'clean' and also remove volumes DEFINED IN THE COMPOSE FILE (DANGER!)
	@echo -e "$(RED)WARNING: This will remove ALL volumes explicitly defined and used in $(COMPOSE_FILE)!$(NC)"
	@read -p "Are you absolutely sure you want to proceed with fclean for $(COMPOSE_FILE)? (yes/NO): " choice; \
	if [ "$$choice" = "yes" ]; then \
		echo -e "$(RED)Executing Full Data Purge for $(COMPOSE_FILE)... This is FAAFO at its most destructive!$(NC)"; \
		$(COMPOSE) down --volumes --remove-orphans --rmi 'none'; \
		echo -e "$(GREEN)Compose-defined volumes removed.$(NC)"; \
	else \
		echo -e "$(YELLOW)fclean aborted by user.$(NC)"; \
	fi

prune: ## Prune unused Docker images, build cache, and dangling volumes (DOCKER SYSTEM PRUNE)
	@echo -e "$(YELLOW)Initiating Docker System Prune... This will remove unused GLOBAL Docker resources.$(NC)"
	@read -p "Are you sure you want to prune unused Docker resources system-wide? (yes/NO): " choice; \
	if [ "$$choice" = "yes" ]; then \
		docker system prune -af --volumes; \
		docker builder prune -af; \
		echo -e "$(GREEN)Docker system prune complete.$(NC)"; \
	else \
		echo -e "$(YELLOW)System prune aborted by user.$(NC)"; \
	fi

# --- Variable Handling for 'service', 'args', 'file' ---
# This allows 'make logs service=backend' or 'make build service=frontend file=docker-compose.prod.yml'
# The 'service', 'args', and 'file' variables will be available to the targets.
# If 'file' is passed, update COMPOSE_FILE and COMPOSE variables.
ifeq ($(file),)
    # file is not set, use default COMPOSE_FILE
else
    COMPOSE_FILE := $(file)
    COMPOSE := docker-compose -f $(COMPOSE_FILE)
endif

# Catch-all for targets that might not explicitly handle 'service' or 'args'
# but are used in the help string or for general structure.
# Or if user types 'make backend' for example, it won't error out.
%:
	@:
