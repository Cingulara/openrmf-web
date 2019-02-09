VERSION ?= 0.2
NAME ?= "openstig-web"
AUTHOR ?= "Dale Bingham"
PORT_EXT ?= 9000
PORT_INT ?= 80
NO_CACHE ?= true
  
.PHONY: build run stop clean version

build:  
	docker build -f Dockerfile . -t $(NAME)\:$(VERSION) --no-cache=$(NO_CACHE)  

run:  
	docker run --rm --name $(NAME) -d -p $(PORT_EXT):$(PORT_INT) $(NAME)\:$(VERSION) && docker ps -a --format "{{.ID}}\t{{.Names}}"|grep $(NAME)  

stop:  
	docker rm -f $(NAME)
  
clean:
	@rm -f obj
	@rm -f bin

version:
	@echo ${VERSION}

DEFAULT: build