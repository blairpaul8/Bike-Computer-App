IMAGE_NAME := appdev
CONTAINER_NAME := app

.PHONY: docker-build docker-run docker-start docker-stop docker-shell docker-rm build

docker-build:
	docker build -t $(IMAGE_NAME) .

docker-run:
	@if [ -z "$$(docker ps -aq -f name=^$(CONTAINER_NAME)$$)" ]; then \
		echo "Creating $(CONTAINER_NAME)..."; \
		docker run -dit \
			--network host \
			-v $(CURDIR):/workspace \
			-w /workspace \
			--name $(CONTAINER_NAME) \
			$(IMAGE_NAME); \
	elif [ -z "$$(docker ps -q -f name=^$(CONTAINER_NAME)$$)" ]; then \
		echo "Starting $(CONTAINER_NAME)..."; \
		docker start $(CONTAINER_NAME); \
	fi
	@docker exec -it -w /workspace $(CONTAINER_NAME) /bin/bash -i

docker-start:
	docker start $(CONTAINER_NAME)

docker-stop:
	docker stop $(CONTAINER_NAME)

docker-shell:
	docker exec -it -w /workspace $(CONTAINER_NAME) /bin/bash -i

docker-rm:
	-docker rm -f $(CONTAINER_NAME)
