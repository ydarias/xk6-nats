# xk6-nats

This is a [k6](https://go.k6.io/k6) extension using the [xk6](https://github.com/k6io/xk6) system, that allows to use NATS protocol.

|  ❗ This extension isn't supported by the k6 team, and may break in the future. USE AT YOUR OWN RISK! |
|------|

- [xk6-nats](#xk6-nats)
  - [Build](#build)
  - [API](#api)
    - [Nats](#nats)
    - [Publishing](#publishing)
    - [Subscribing](#subscribing)
    - [JetStream](#jetstream)
      - [JetStream operations](#jetstream-operations)
    - [Return values](#return-values)
  - [Examples](#examples)
  - [License](#license)

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
k6 run -e NATS_HOSTNAME=localhost test/test.js
```

To run JetStream test, make sure NATS JetStream is started, e.g. `nats-server -js`

```shell
k6 run -e NATS_HOSTNAME=localhost test/test_jetstream.js
```

To run publish with headers test, make sure NATS JetStream is started, e.g. `nats-server -js`

```shell
./k6 run -e NATS_HOSTNAME=localhost test/test_headers.js
```

## API

### Nats

A Nats instance represents the connection with the NATS server, and it is created with `new Nats(configuration)`, where configuration attributes are:

| Attribute | Description |
| --- | --- |
| `servers` | (mandatory) is the list of servers where NATS is available (e.g. `[nats://localhost:4222]`) |
| `unsafe` | (optional) allows running with self-signed certificates when doing tests against a testing environment, it is a boolean value (default value is `false`) |
| `token` | (optional) is the value of the token used to connect to the NATS server |

Example:

```ts
import {Nats} from 'k6/x/nats'

const natsConfig = {
    servers: ['nats://localhost:4222'],
    unsafe: true,
}

const nats = new Nats(natsConfig)
```

### Publishing

You can publish messages to a topic using the following functions:

| Function | Description |
| --- | --- |
| `publish(topic, payload)` | publish a new message using the topic (string) and the given payload that is a string representation that later is serialized as a byte array |
| `publisWithHeaders(topic, payload, headers)` | publish a new message using the topic (string), the given payload that is a string representation that later is serialized as a byte array and the headers |
| `publishMsg(message)` | publish a new message using the `message` (object) that has the following attributes: `topic` (string), `data` (string), `raw`(byte array) and `headers` (object) |
| `request(topic, payload, headers)` | sends a request to the topic (string) and the given payload as string representation and the headers, and returns a `message` |

Example:

```ts
const publisher = new Nats(natsConfig)

publisher.publish('topic', 'data')
publisher.publishWithHeaders('topic', 'data', { 'header1': 'value1' })
publisher.publishMsg({ topic: 'topic', data: 'string data', headers: { 'header1': 'value1' } })
publisher.publishMsg({ topic: 'topic', raw: [ 0, 1, 2, 3 ], headers: { 'header1': 'value1' } })
const message = publisher.request('topic', 'data', { 'header1': 'value1' })
```

### Subscribing

You can subscribe to a topic using the following functions:

| Function | Description |
| --- | --- |
| `subscribe(topic, callback)` | subscribe to a topic (string) and execute the callback function when a `message` is received, it returns a `subscription` |

Example:

```ts
const subscriber = new Nats(natsConfig)
const subscription = subscriber.subscribe('topic', (msg) => {
    console.log(msg.data)
})
// ...
subscription.close()
```

### JetStream

You can use JetStream Pub/Sub in the same way as NATS Pub/Sub. The only difference is that you need to setup the stream before publishing or subscribing to it.

The configuration is the same as the one used in the nats-io's `StreamConfig`:

| Attribute | Description |
| --- | --- |
| `name` | (mandatory) is the name of the stream |
| `description` | (optional) is the description of the stream |
| `subjects` | (mandatory) is the list of subjects that the stream will be listening to |
| `retention` | (optional) is the retention policy of the stream, it can be `limits`, `interest`, `workqueue` or `stream` |
| `max_consumers` | (optional) is the maximum number of consumers that the stream will allow |
| `max_msgs` | (optional) is the maximum number of messages that the stream will store |
| `max_bytes` | (optional) is the maximum number of bytes that the stream will store |
| `max_age` | (optional) is the maximum age of the messages that the stream will store |
| `max_msg_size` | (optional) is the maximum size of the messages that the stream will store |
| `discard` | (optional) is the discard policy of the stream, it can be `old`, `new` or `none` |
| `storage` | (optional) is the type of storage that the stream will use, it can be `file` or `memory` |
| `replicas` | (optional) is the number of replicas that the stream will have |
| `no_ack` | (optional) is a boolean value that indicates if the stream will use acks or not |

Example:

```ts
const streamConfig = {
    name: "mock",
    subjects: ["foo"],
    max_msgs_per_subject: 100,
    discard: 0,
    storage: 1
}

const publisher = new Nats(natsConfig)
publisher.jetStreamSetup(streamConfig)
```

#### JetStream operations

Once the stream is setup, you can publish and subscribe to it using the following functions:

| Function | Description |
| --- | --- |
| `jetStreamSetup(config)` | setup a stream with the given configuration |
| `jetStreamPublish(topic, payload)` | publish a new message using the topic (string) and the given payload that is a string representation that later is serialized as a byte array |
| `jetStreamPublishWithHeaders(topic, payload, headers)` | publish a new message using the topic (string), the given payload that is a string representation that later is serialized as a byte array and the headers |
| `jetStreamPublishMsg(message)` | publish a new message using the `message` (object) that has the following attributes: `topic` (string), `data` (string), `raw`(byte array) and `headers` (object) |
| `jetStreamSubscribe(topic, callback)` | subscribe to a topic (string) and execute the callback function when a `message` is received, it returns a `subscription` |

Example:

```ts
const subscriber = new Nats(natsConfig)
publisher.jetStreamSetup(streamConfig)
const subscription = subscriber.jetStreamSubscribe('mock', (msg) => {
    console.log(msg.data)
})

const publisher = new Nats(natsConfig)
publisher.jetStreamPublish('foo', 'data')
publisher.jetStreamPublishWithHeaders('foo', 'data', { 'header1': 'value1' })
publisher.jetStreamPublishMsg({ topic: 'topic', data: 'string data', headers: { 'header1': 'value1' } })
publisher.jetStreamPublishMsg({ topic: 'topic', raw: [ 0, 1, 2, 3 ], headers: { 'header1': 'value1' } })

// ...

subscription.close()
```

### Return values

A `subscription` return value has the following methods:

| Method | Description |
| --- | --- |
| `close()` | closes the subscription |

A `message` return value has the following attributes:

| Attribute | Description |
| --- | --- |
| `raw` | the payload in byte array format |
| `data` | the payload in string format |
| `topic` | the topic where the message was published |
| `headers` | the headers of the message |

## Examples

You can find some examples in the [examples](examples) folder. To run them, you need to have a NATS server running and then run the following command:

```shell
k6 run -e NATS_HOSTNAME=your_nats_server_host examples/binary.js
k6 run -e NATS_HOSTNAME=your_nats_server_host examples/complex.js
k6 run -e NATS_HOSTNAME=your_nats_server_host examples/simple.js
k6 run -e NATS_HOSTNAME=your_nats_server_host examples/withHeaders.js
```

Or you can check the [test](test) folder to see how to use the extension.

## License

The source code of this project is released under the [MIT License](LICENSE).