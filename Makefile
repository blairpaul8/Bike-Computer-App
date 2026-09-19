IMAGE_NAME := test-dev-env
CONTAINER_NAME := app
BUSID ?=
ESP_PORT ?= /dev/ttyUSB0

.PHONY: docker-build docker-run docker-start docker-stop docker-shell build

# Docker commands
docker-build:
	docker build -t $(IMAGE_NAME) .


docker-run:
	docker run -dit \
		-v $(shell pwd):/workspace \
		--name $(CONTAINER_NAME) \
		$(IMAGE_NAME)

docker-start:
	docker start $(CONTAINER_NAME)

docker-stop:
	docker stop $(CONTAINER_NAME)

docker-shell:
	docker exec -it $(CONTAINER_NAME) /bin/bash -i

# Commands for packaging and flashing code
build:
	idf.py build

flash:
	idf.py -p /dev/ttyUSB0 flash monitor
