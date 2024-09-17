VERSION ?= 1.12.00
NAME ?= "openrmf-web"
AUTHOR ?= "Dale Bingham"
NO_CACHE ?= true
DOCKERHUB_ACCOUNT ?= cingulara
  
.PHONY: build docker latest run stop clean version dockerhub

docker: 
	docker build -f Dockerfile -t $(NAME)\:$(VERSION) --no-cache=$(NO_CACHE) .
	docker build -f Dockerfile.privileged -t $(NAME)\:$(VERSION)-privileged --no-cache=$(NO_CACHE) .

latest: 
	docker build -f Dockerfile -t $(NAME)\:latest --no-cache=$(NO_CACHE) .
	docker tag $(NAME)\:latest ${DOCKERHUB_ACCOUNT}\/$(NAME)\:latest
	docker push ${DOCKERHUB_ACCOUNT}\/$(NAME)\:latest

version:
	@echo ${VERSION}

dockerhub:
	docker tag $(NAME)\:$(VERSION) ${DOCKERHUB_ACCOUNT}\/$(NAME)\:$(VERSION)
	docker push ${DOCKERHUB_ACCOUNT}\/$(NAME)\:$(VERSION)
	docker tag $(NAME)\:$(VERSION)-privileged ${DOCKERHUB_ACCOUNT}\/$(NAME)\:$(VERSION)-privileged
	docker push ${DOCKERHUB_ACCOUNT}\/$(NAME)\:$(VERSION)-privileged

DEFAULT: latest