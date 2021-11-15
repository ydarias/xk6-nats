# xk6-nats

This is a [k6](https://go.k6.io/k6) extension using the [xk6](https://github.com/k6io/xk6) system, that allows to use NATS protocol.

| :exclamation: This is a proof of concept, isn't supported by the k6 team, and may break in the future. USE AT YOUR OWN RISK! |
|------|

## Build

To build a `k6` binary with this extension, first ensure you have the prerequisites:

- [Go toolchain](https://go101.org/article/go-toolchain.html)
- Git

1. Install `xk6` framework for extending `k6`:
```shell
go install go.k6.io/xk6/cmd/xk6@latest
```

2. Build the binary:
```shell
xk6 build --with github.com/ydarias/xk6-nats@latest
```

3. Run a test
```shell
./k6 run folder/test.js
```

## Test structure

```javascript
import { sleep } from 'k6';
import { Nats } from 'k6/x/nats';

const publisher = new Nats('nats://localhost:4222');
const subscriber = new Nats('nats://localhost:4222');

export function setup() {
}

export default function () {
    const handler = function(msg) { console.log('received data: ' + msg.data) };
    subscriber.subscribe('topic', handler);

    sleep(1)

    publisher.publish('topic', '{ "foo": "bar" }');
    publisher.publish('topic', '{ "foo": "1" }');
    publisher.publish('topic', '{ "foo": "2" }');
    publisher.publish('topic', '{ "foo": "3" }');

    sleep(1)
}

export function teardown() {
    publisher.close();
    subscriber.close();
}
```
