# Makefile for Oakville and Milton Humane Society Project
.PHONY: lint format migration generate-migration start-docker stop-docker clean-db seed-db read-tables read-table help 

# Linting & Formatting
lint:
	docker exec -it humane_society_backend /bin/bash -c "yarn lint"
	docker exec -it humane_society_frontend /bin/bash -c "yarn lint"

format:
	docker exec -it humane_society_backend /bin/bash -c "yarn fix"
	docker exec -it humane_society_frontend /bin/bash -c "yarn fix"

# Database Migrations
migration:
	docker exec -it humane_society_backend /bin/bash -c "node migrate up"

generate-migration:
ifndef NAME
	$(error NAME argument was not provided. Command should include a NAME parameter)
endif
	docker exec -it humane_society_backend /bin/bash -c "node migrate create --name $(NAME).ts"

# Docker Commands
start-docker:
	docker-compose up --build

stop-docker:
	docker-compose down

# Database Operations
clean-db:
	docker exec -it humane_society_backend /bin/bash -c "node migrate down --to 0 && node migrate up"

# Seeding script has not been created yet
seed-db:
# docker exec -it humane_society_backend /bin/bash -c "node seed"

# Acessing Postgres DB
read-tables: 
	docker exec -it humane_society_db /bin/bash -c "\
    psql -U postgres -d humane_society_dev -c '\dt';"

read-table:
ifndef TABLE
	$(error TABLE argument was not provided. Command should include a TABLE parameter)
endif
	docker exec -it humane_society_db /bin/bash -c "\
	psql -U postgres -d humane_society_dev -c '\dt'; \
	psql -U postgres -d humane_society_dev -c 'SELECT * FROM $(TABLE);'"

# Help
help:
	@echo Available targets or actions:
	@echo lint               Lint the code
	@echo format             Format the code
	@echo migration          Run database migrations
	@echo generate-migration Generate a new migration. Requires a NAME argument. Example: ```make generate-migration NAME=add-user-columns``` 
	@echo start-docker       Start Docker containers
	@echo stop-docker        Stop Docker containers
	@echo read-tables        See all database tables
	@echo read-table         See a single table. Requires a TABLE argument. Example: ```make read-table TABLE=users```
	@echo clean-db           Clean the database and rerun migrations
	@echo seed-db            The database seeding script has yet to be implemented
	@echo help               Show this help message