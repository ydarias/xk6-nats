import nats from 'k6/x/nats';

const conn = nats.connect('nats://localhost:4222');

export function setup() {
}

export default function () {
    nats.subscribe(conn, 'topic', (message) => {
        console.log(`Data > ${message.data} @ ${message.subject}`);
    });

    nats.publish(conn, 'topic', '{ "foo": "bar" }');
}

export function teardown() {
    nats.close(conn);
}
