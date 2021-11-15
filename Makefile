compile:
	xk6 build --with xk6-nats=.

nats/docker-local:
	docker run -d --name nats-tests -p 4222:4222 nats

test/run:
	./k6 run test/test.js