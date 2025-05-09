# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mlamkadm <mlamkadm@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/03/08 14:45:36 by mlamkadm          #+#    #+#              #
#    Updated: 2025/03/08 14:45:36 by mlamkadm         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


# ======================================================================================
# VARS
# ======================================================================================

NAME = docker-compose.yml
COMPOSE = docker-compose -f $(NAME)

# ======================================================================================
# MAIN TARGETS
# ======================================================================================


.PHONY: all build rebuild no-cache up down run logs it exec ls re clean fclean re prune netprune rmextern

all: build

# ======================================================================================
# MANAGEMENT
# ======================================================================================

build:
	@echo "Building containers..."
	@$(COMPOSE) build

rebuild: fclean run

no-cache:
	@echo "Building containers With no-cache ..."
	@$(COMPOSE) build --no-cache

up: build
	@echo "Starting containers in detached mode..."
	@$(COMPOSE) up -d

down:
	@echo "Stopping containers..."
	@$(COMPOSE) down

run: down
	@echo "Starting containers and following logs..."
	@$(COMPOSE) up -d
	@$(COMPOSE) logs -f
config:
	@echo "Displaying configuration..."
	@$(COMPOSE) config

# ======================================================================================
# DEBUG & INFO
# ======================================================================================

logs:
	@echo "Displaying logs..."
	@$(COMPOSE) logs -f

it:
	@$(COMPOSE) exec $(filter-out $@, $(MAKECMDGOALS)) /bin/bash

exec:
	@$(COMPOSE) exec $(filter-out $@, $(MAKECMDGOALS))

inspect:
	@docker inspect $(filter-out $@, $(MAKECMDGOALS))

# env:
# 	@docker inspect $(filter-out $@, $(MAKECMDGOALS)) | grep env

ls:
	@echo "===========[ Containers"
	@$(COMPOSE) ps
	@echo "===========[ Volumes" 
	@docker volume ls
	@echo "===========[ Images"
	@$(COMPOSE) images

# ======================================================================================
# CLEANING
# ======================================================================================

re: down run

clean:
	@echo "Removing containers, images, and volumes..."
	@$(COMPOSE) down --volumes --remove-orphans --rmi all
	@$(COMPOSE) rm -f

fclean: clean
	@echo "Performing complete cleanup..."
	@make prune

prune: clean netprune
	@echo "Pruning Docker system..."
	@docker system prune -f

netprune:
	@echo "Pruning Docker networks..."
	@docker network prune -f


# rmextern: down
# 	@echo "removing externally bounded volumes"
# 	@sudo rm -rf /home/mlamkadm/data # eg.


