VERSION ?= 0.6
NAME ?= "openrmf-web"
AUTHOR ?= "Dale Bingham"
PORT_EXT ?= 9000
PORT_INT ?= 80
NO_CACHE ?= true
DOCKERHUB_ACCOUNT ?= cingulara
  
.PHONY: build docker latest run stop clean version dockerhub

docker: 
	docker build -f Dockerfile -t $(NAME)\:$(VERSION) --no-cache=$(NO_CACHE) .

latest: 
	docker build -f Dockerfile -t $(NAME)\:latest --no-cache=$(NO_CACHE) .
	docker login -u ${DOCKERHUB_ACCOUNT}
	docker tag $(NAME)\:latest ${DOCKERHUB_ACCOUNT}\/$(NAME)\:latest
	docker push ${DOCKERHUB_ACCOUNT}\/$(NAME)\:latest
	docker logout

run:  
	docker run --rm --name $(NAME) -d -p $(PORT_EXT):$(PORT_INT) $(NAME)\:$(VERSION) && docker ps -a --format "{{.ID}}\t{{.Names}}"|grep $(NAME)  

stop:  
	docker rm -f $(NAME)
  
clean:
	@rm -f -r obj
	@rm -f -r bin

version:
	@echo ${VERSION}

dockerhub:
	docker login -u ${DOCKERHUB_ACCOUNT}
	docker tag $(NAME)\:$(VERSION) ${DOCKERHUB_ACCOUNT}\/$(NAME)\:$(VERSION)
	docker tag $(NAME)\:$(VERSION) ${DOCKERHUB_ACCOUNT}\/$(NAME)\:latest
	docker push ${DOCKERHUB_ACCOUNT}\/$(NAME)\:$(VERSION)
	docker push ${DOCKERHUB_ACCOUNT}\/$(NAME)\:latest
	docker logout

DEFAULT: latest