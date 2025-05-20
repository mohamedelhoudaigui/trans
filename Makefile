# ======================================================================================
# CONFIGURATION & ENVIRONMENT
# ======================================================================================
# Use bash for more advanced shell features if needed, though POSIX sh is more portable.
SHELL := /bin/bash
# Load .env file for variables used by Docker Compose AND this Makefile.
# This ensures consistency. Docker Compose automatically loads .env, but Makefile needs explicit loading.
# Only load if .env exists.
ifneq (,$(wildcard ./.env))
    include .env
    export $(shell sed 's/=.*//' .env) # Export all variables from .env to the environment for sub-shells
endif

# Core Compose Command
COMPOSE_FILES := docker-compose.yml
# Add override files if they exist (good for local dev vs. CI)
# ifneq (,$(wildcard ./docker-compose.override.yml))
#    COMPOSE_FILES += -f docker-compose.override.yml
# endif
COMPOSE := docker-compose -f $(COMPOSE_FILES)

# Default project name if not set in .env (Docker Compose usually derives this from directory name)
PROJECT_NAME ?= $(shell basename $(CURDIR))

# Services - define groups for easier management
CORE_SERVICES := backend frontend # Application core
DEVOP_TOOLS   := dockge prometheus grafana # Management & Monitoring
LOG_STACK     := elasticsearch logstash kibana filebeat # ELK Stack
ALL_SERVICES  := $(CORE_SERVICES) $(DEVOP_TOOLS) $(LOG_STACK)

# Colors for Makefile output - "Pragmatic Purity" in presentation
RED     := \033[0;31m
GREEN   := \033[0;32m
YELLOW  := \033[1;33m
BLUE    := \033[0;34m
NC      := \033[0m

# ======================================================================================
# DEFAULT TARGET & SELF-DOCUMENTATION (Axiom: Know Thyself, Build Thyself)
# ======================================================================================
.DEFAULT_GOAL := help

# Phony targets don't represent files
.PHONY: help up down logs ps build rebuild no-cache restart re config status clean fclean prune \
        up-core up-devops up-logs \
        logs-core logs-devops logs-logs \
        stop start restart-service \
        validate-config ssh exec inspect test list-volumes list-networks \
        elk-reset-data

help:
	@echo -e "$(BLUE)========================================================================="
	@echo -e " Himothy Covenant - Chimera Ecosystem Command & Control Makefile "
	@echo -e "=========================================================================$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Usage: make [target] [service=SERVICE_NAME] [args="ARGS"]$(NC)"
	@echo ""
	@echo -e "$(GREEN)Environment & Configuration:$(NC)"
	@echo -e "  validate-config     - Check for required .env files and critical variables."
	@echo -e "  config              - Validate and display Docker Compose configuration."
	@echo ""
	@echo -e "$(GREEN)Core Stack Management:$(NC)"
	@echo -e "  up                  - Start all services in detached mode (Alias: start)."
	@echo -e "  down                - Stop and remove all services and networks."
	@echo -e "  restart             - Restart all services (down + up)."
	@echo -e "  re                  - Rebuild images and restart all services (down + build + up)."
	@echo -e "  stop                - Stop all services without removing them (Alias for 'docker-compose stop')."
	@echo ""
	@echo -e "$(GREEN)Service Group Management:$(NC)"
	@echo -e "  up-core             - Start only core application services: $(CORE_SERVICES)."
	@echo -e "  up-devops           - Start only DevOps tooling: $(DEVOP_TOOLS)."
	@echo -e "  up-logs             - Start only logging (ELK) stack: $(LOG_STACK)."
	@echo ""
	@echo -e "$(GREEN)Building Images:$(NC)"
	@echo -e "  build               - Build (or rebuild) images for all services."
	@echo -e "  build service=<name> - Build image for a specific service."
	@echo -e "  no-cache            - Build all images without using cache."
	@echo -e "  no-cache service=<name> - Build specific service image without cache."
	@echo ""
	@echo -e "$(GREEN)Information & Debugging (Axiom IV.D - If It Moves, Metric It):$(NC)"
	@echo -e "  status              - Show status of running services (Alias: ps)."
	@echo -e "  logs                - Follow logs for all services."
	@echo -e "  logs service=<name> - Follow logs for a specific service or group (core, devops, logs)."
	@echo -e "  ssh service=<name>  - Get an interactive shell into a running service (Alias: it)."
	@echo -e "  exec service=<name> args=\"<cmd>\" - Execute a command in a running service."
	@echo -e "  inspect service=<name> - Inspect a running service container."
	@echo -e "  list-volumes        - List Docker volumes associated with this project."
	@echo -e "  list-networks       - List Docker networks associated with this project."
	@echo ""
	@echo -e "$(GREEN)Cleaning & Pruning (Axiom IV.C - Technical Debt is the Enemy):$(NC)"
	@echo -e "  clean               - Remove stopped service containers and project-specific networks."
	@echo -e "  fclean              - Perform 'clean' and also remove project-specific volumes."
	@echo -e "  prune               - Prune unused Docker images, build cache, and dangling volumes (Docker system prune)."
	@echo ""
	@echo -e "$(GREEN)Specific Service Management:$(NC)"
	@echo -e "  stop-service service=<name>   - Stop a specific service."
	@echo -e "  start-service service=<name>  - Start a specific service (must exist)."
	@echo -e "  restart-service service=<name> - Restart a specific service."
	@echo ""
	@echo -e "$(GREEN)Testing & Utility:$(NC)"
	@echo -e "  test                - Run the extensive DB & Backend test script (./test_db_extensive.sh)."
	@echo -e "  elk-reset-data      - Stop ELK stack and remove Elasticsearch data volume (for fresh logs)."
	@echo ""
	@echo -e "$(YELLOW)Examples:$(NC)"
	@echo -e "  make up"
	@echo -e "  make logs service=backend"
	@echo -e "  make ssh service=elasticsearch"
	@echo -e "  make exec service=backend args=\"ls -la /usr/src/app\""
	@echo -e "  make fclean"
	@echo -e "$(BLUE)-------------------------------------------------------------------------$(NC)"

# ======================================================================================
# ENVIRONMENT VALIDATION
# ======================================================================================
validate-config:
	@echo -e "$(YELLOW)Validating Himothy Covenant Configuration...$(NC)"
	@if [ ! -f .env ]; then \
		echo -e "$(RED)ERROR: Root .env file is missing! Copy example.env to .env and configure.$(NC)"; \
		exit 1; \
	else \
		echo -e "$(GREEN)Root .env file found.$(NC)"; \
	fi
	@if [ ! -f backend/.env ]; then \
		echo -e "$(RED)ERROR: backend/.env file is missing! Copy backend/example_env to backend/.env and configure.$(NC)"; \
		exit 1; \
	else \
		echo -e "$(GREEN)backend/.env file found.$(NC)"; \
		grep -q "DB_PATH=/dbdata/database.db" backend/.env || \
			(echo -e "$(RED)ERROR: backend/.env DB_PATH is not correctly set to /dbdata/database.db!$(NC)" && exit 1); \
		echo -e "$(GREEN}backend/.env DB_PATH is correctly configured.$(NC)"; \
	fi
	@# Add more critical variable checks here (e.g., ELASTIC_VERSION)
	@if [ -z "$$ELASTIC_VERSION" ]; then \
		echo -e "$(RED)ERROR: ELASTIC_VERSION is not set in your .env file. ELK stack may not function correctly.$(NC)"; \
		exit 1; \
	else \
		echo -e "$(GREEN)ELASTIC_VERSION is set to: $$ELASTIC_VERSION.$(NC)"; \
	fi
	@echo -e "$(GREEN)Configuration validation passed basic checks.$(NC)"

# ======================================================================================
# CORE STACK MANAGEMENT
# ======================================================================================
up: validate-config ## Start all services in detached mode
	@echo -e "$(GREEN)Initiating Chimera Full Stack Ignition... All systems GO!$(NC)"
	@$(COMPOSE) up -d --remove-orphans
start: up ## Alias for 'up'

down: ## Stop and remove all services and networks
	@echo -e "$(RED)Initiating Chimera Full Stack Shutdown... Powering down all systems.$(NC)"
	@$(COMPOSE) down --remove-orphans
stop: ## Stop all services without removing them
	@echo -e "$(YELLOW)Halting Chimera operations... Services stopping but not removed.$(NC)"
	@$(COMPOSE) stop

restart: down up ## Restart all services

re: down build up ## Rebuild images and restart all services

# ======================================================================================
# SERVICE GROUP MANAGEMENT
# ======================================================================================
up-core: validate-config ## Start core application services
	@echo -e "$(GREEN)Igniting Core Application Services: $(CORE_SERVICES)...$(NC)"
	@$(COMPOSE) up -d $(CORE_SERVICES)
up-devops: validate-config ## Start DevOps tooling
	@echo -e "$(GREEN)Powering Up DevOps Sanctum: $(DEVOP_TOOLS)...$(NC)"
	@$(COMPOSE) up -d $(DEVOP_TOOLS)
up-logs: validate-config ## Start logging (ELK) stack
	@echo -e "$(GREEN)Activating Chimera's All-Seeing Eye (ELK Stack): $(LOG_STACK)...$(NC)"
	@$(COMPOSE) up -d $(LOG_STACK)

# ======================================================================================
# BUILDING IMAGES (Axiom: Build Thyself)
# ======================================================================================
build: ## Build (or rebuild) images for specified services, or all if none specified
	@echo -e "$(BLUE)Forging Chimera components... Building images for: $(or $(service),ALL services).$(NC)"
	@$(COMPOSE) build $(service)
rebuild: build ## Alias for build

no-cache: ## Build images without using cache for specified services, or all
	@echo -e "$(YELLOW)Force-forging Chimera components (no cache)... Building images for: $(or $(service),ALL services).$(NC)"
	@$(COMPOSE) build --no-cache $(service)

# ======================================================================================
# INFORMATION & DEBUGGING
# ======================================================================================
status: ## Show status of running services
	@echo -e "$(BLUE)Chimera System Status Report:$(NC)"
	@$(COMPOSE) ps $(service)
ps: status ## Alias for status

logs: ## Follow logs for specified services, or all if none specified
	@echo -e "$(BLUE)Tapping into Chimera's data stream... Logs for: $(or $(service),ALL services).$(NC)"
	@$(COMPOSE) logs -f --tail="100" $(service)
logs-core: ## Follow logs for core services
	@$(COMPOSE) logs -f --tail="100" $(CORE_SERVICES)
logs-devops: ## Follow logs for devops tools
	@$(COMPOSE) logs -f --tail="100" $(DEVOP_TOOLS)
logs-logs: ## Follow logs for ELK stack
	@$(COMPOSE) logs -f --tail="100" $(LOG_STACK)

ssh: ## Get an interactive shell into a running service container
	@if [ -z "$(service)" ]; then \
		echo -e "$(RED)Error: Service name required. Usage: make ssh service=<service_name>$(NC)"; \
		exit 1; \
	fi
	@echo -e "$(GREEN)Establishing Himothy DirectConnect™ to $(service)... Standby for shell access.$(NC)"
	@$(COMPOSE) exec $(service) /bin/sh || $(COMPOSE) exec $(service) /bin/bash || echo -e "$(RED)Failed to find /bin/sh or /bin/bash in $(service).$(NC)"
it: ssh ## Alias for ssh

exec: ## Execute a command in a running service container
	@if [ -z "$(service)" ] || [ -z "$(args)" ]; then \
		echo -e "$(RED)Error: Service name and command required. Usage: make exec service=<service_name> args=\"<command>\"$(NC)"; \
		exit 1; \
	fi
	@echo -e "$(GREEN)Executing remote directive in $(service): $(args)...$(NC)"
	@$(COMPOSE) exec $(service) $(args)

inspect: ## Inspect a running service container
	@if [ -z "$(service)" ]; then \
		echo -e "$(RED)Error: Service name required. Usage: make inspect service=<service_name>$(NC)"; \
		exit 1; \
	fi
	@echo -e "$(BLUE)Performing deep scan of $(service) internals...$(NC)"
	@docker inspect $$(docker-compose -f $(COMPOSE_FILES) ps -q $(service) | head -n 1)

config: ## Validate and display Docker Compose configuration
	@echo -e "$(BLUE)Chimera Blueprint Configuration:$(NC)"
	@$(COMPOSE) config

list-volumes: ## List Docker volumes associated with this project
	@echo -e "$(BLUE)Project Docker Volumes ($(PROJECT_NAME)):$(NC)"
	@docker volume ls --filter "label=com.docker.compose.project=$(PROJECT_NAME)" --filter "name=$(PROJECT_NAME)_*" --format "table {{.Name}}\t{{.Driver}}\t{{.Labels}}"
	@echo -e "$(YELLOW)Note: Bind mount volumes defined with 'name:' in compose might not be labeled by project automatically. List all for full view: 'docker volume ls'$(NC)"

list-networks: ## List Docker networks associated with this project
	@echo -e "$(BLUE)Project Docker Networks ($(PROJECT_NAME)):$(NC)"
	@docker network ls --filter "label=com.docker.compose.project=$(PROJECT_NAME)" --filter "name=$(PROJECT_NAME)_*" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

# ======================================================================================
# CLEANING & PRUNING
# ======================================================================================
clean: ## Remove stopped service containers and project-specific networks
	@echo -e "$(YELLOW)Sanitizing Chimera workspace... Removing stopped containers and networks.$(NC)"
	@$(COMPOSE) down --remove-orphans --rmi 'none' # Keep images, remove only containers/networks

fclean: ## Perform 'clean' and also remove project-specific volumes (DANGER!)
	@echo -e "$(RED)WARNING: This will remove ALL project-specific Docker volumes (e.g., sqlite_data, elasticsearch_data)!$(NC)"
	@read -p "Are you absolutely sure you want to proceed with fclean? (yes/NO): " choice; \
	if [ "$$choice" = "yes" ]; then \
		echo -e "$(RED)Executing Full Chimera Data Purge... This is FAAFO at its most destructive!$(NC)"; \
		$(COMPOSE) down --volumes --remove-orphans --rmi 'none'; \
		echo -e "$(GREEN)Project volumes removed.$(NC)"; \
	else \
		echo -e "$(YELLOW)fclean aborted by user.$(NC)"; \
	fi

prune: ## Prune unused Docker images, build cache, and dangling volumes
	@echo -e "$(YELLOW)Initiating Docker System Prune... This will remove unused global Docker resources.$(NC)"
	@read -p "Are you sure you want to prune unused Docker resources system-wide? (yes/NO): " choice; \
	if [ "$$choice" = "yes" ]; then \
		docker system prune -af --volumes; \
		docker builder prune -af; \
		echo -e "$(GREEN)Docker system prune complete.$(NC)"; \
	else \
		echo -e "$(YELLOW)System prune aborted by user.$(NC)"; \
	fi

# ======================================================================================
# SPECIFIC SERVICE MANAGEMENT
# ======================================================================================
stop-service: ## Stop a specific service
	@if [ -z "$(service)" ]; then echo -e "$(RED)Error: service name required.$(NC)"; exit 1; fi
	@echo -e "$(YELLOW)Halting service: $(service)...$(NC)"
	@$(COMPOSE) stop $(service)

start-service: ## Start a specific service
	@if [ -z "$(service)" ]; then echo -e "$(RED)Error: service name required.$(NC)"; exit 1; fi
	@echo -e "$(GREEN)Igniting service: $(service)...$(NC)"
	@$(COMPOSE) up -d --no-deps $(service) # --no-deps to not start its dependencies if not running

restart-service: ## Restart a specific service
	@if [ -z "$(service)" ]; then echo -e "$(RED)Error: service name required.$(NC)"; exit 1; fi
	@echo -e "$(YELLOW)Recycling service: $(service)...$(NC)"
	@$(COMPOSE) restart $(service)

# ======================================================================================
# TESTING & UTILITY
# ======================================================================================
test: validate-config ## Run the extensive DB & Backend test script
	@echo -e "$(GREEN)Initiating Himothy Covenant FAAFO Test Protocol (Extensive DB)...$(NC)"
	@if [ -f ./test_db_extensive.sh ]; then \
		chmod +x ./test_db_extensive.sh; \
		./test_db_extensive.sh; \
	else \
		echo -e "$(RED)ERROR: ./test_db_extensive.sh not found!$(NC)"; \
		exit 1; \
	fi

elk-reset-data: ## Stop ELK stack and remove Elasticsearch data volume
	@echo -e "$(RED)WARNING: This will stop the ELK stack and PERMANENTLY DELETE Elasticsearch data!$(NC)"
	@read -p "Are you sure you want to reset ELK data? (yes/NO): " choice; \
	if [ "$$choice" = "yes" ]; then \
		echo -e "$(YELLOW)Stopping ELK stack services: $(LOG_STACK)...$(NC)"; \
		$(COMPOSE) stop $(LOG_STACK); \
		echo -e "$(RED)Removing Elasticsearch data volume: $(PROJECT_NAME)_elasticsearch_data...$(NC)"; \
		docker volume rm $(PROJECT_NAME)_elasticsearch_data || echo -e "$(YELLOW)Volume already removed or error during removal.$(NC)"; \
		echo -e "$(GREEN)ELK data reset. You can now 'make up-logs' to restart with fresh data.$(NC)"; \
	else \
		echo -e "$(YELLOW)ELK data reset aborted by user.$(NC)"; \
	fi

# --- Catch-all for service arguments ---
# This allows 'make logs service=backend' or 'make build service=frontend'
# The 'service' variable will be available to the targets.
%:
	@:
