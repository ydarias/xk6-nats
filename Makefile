install:
	go install go.k6.io/xk6/cmd/xk6@latest

compile:
	xk6 build --with xk6-nats=.

nats/docker-local:
	docker run -d --name nats-tests -p 4222:4222 nats -js

test/run:
	./k6 run -e NATS_HOSTNAME=localhost test/test.js
	./k6 run -e NATS_HOSTNAME=localhost test/test_jetstream.js
	./k6 run -e NATS_HOSTNAME=localhost test/test_headers.js
	./k6 run -e NATS_HOSTNAME=localhost test/test_msg_binary.js
	./k6 run -e NATS_HOSTNAME=localhost test/test_msg_binary_headers.js
	./k6 run -e NATS_HOSTNAME=localhost test/test_msg_string.js
	./k6 run -e NATS_HOSTNAME=localhost test/test_msg_string_headers.js