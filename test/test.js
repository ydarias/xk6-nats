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
