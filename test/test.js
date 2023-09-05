import {check, sleep} from 'k6';
import {Nats} from 'k6/x/nats';

const natsConfig = {
    servers: [`nats://${__ENV.NATS_HOSTNAME}:4222`],
    unsafe: true,
};

let counter = 0;
const publisher = new Nats(natsConfig);
const subscriber = new Nats(natsConfig);
const responses = {};
const subscription = subscriber.subscribe('topic', (msg) => {
    responses[msg.data] = msg;
});

export default function () {
    const data = `${++counter}the message`;
    publisher.publish('topic', data);
    sleep(1)

    const message = responses[data];
    check(message, {
        'Is expected message': (m) => m.data === data,
        'Is expected topic': (m) => m.topic === 'topic',
    })
}

export function teardown() {
    subscription.close();
    publisher.close();
    subscriber.close();
}
