import { check, sleep } from 'k6';
import { Nats } from 'k6/x/nats';

const publisher = new Nats('nats://localhost:4222');
const subscriber = new Nats('nats://localhost:4222');

export function setup() {
}

export default function () {
    subscriber.subscribe('topic', (msg) => {
        check(msg, {
            'Is expected message': (m) => m.data === 'the message',
            'Is expected topic': (m) => m.topic === 'topic',
        })
    });

    sleep(1)

    publisher.publish('topic', 'the message');

    sleep(1)
}

export function teardown() {
    publisher.close();
    subscriber.close();
}
