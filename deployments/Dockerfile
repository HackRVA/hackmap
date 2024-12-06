FROM golang:1.22 AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o main ./cmd/server

FROM ubuntu:latest

WORKDIR /root/
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

COPY --from=builder /app/main .

RUN chmod +x ./main

EXPOSE 8080

CMD ["./main"]
