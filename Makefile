
run:
	go run ./cmd/server/

build:
	go build ./cmd/server/

build-docker:
	docker build -t hackmap -f ./deployments/Dockerfile .
run-docker:
	docker run -p 8080:8080 -v $(PWD)/store:/store hackmap

