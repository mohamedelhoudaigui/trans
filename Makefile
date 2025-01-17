############################################################

#PROJECT:= inception

#COMPOSE_PATH = docker-compose.yml

BASE = docker compose

############################################################

up: down
	$(BASE) up --build -d

build: down
	$(BASE) build --no-cache

down:
	$(BASE) down --remove-orphans

logs:
	$(BASE) logs -f

ps:
	$(BASE) ps

run:
	@$(BASE) run -d "$(filter-out $@,$(MAKECMDGOALS))"

fclean:
	docker system prune -af --volumes

############################################################

it:
	$(BASE) exec -it "$(filter-out $@,$(MAKECMDGOALS))" "/bin/bash"

restart:
	$(BASE) restart $(filter-out $@,$(MAKECMDGOALS))


