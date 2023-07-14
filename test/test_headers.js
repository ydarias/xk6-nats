import {check, sleep} from 'k6';
import {Nats} from 'k6/x/nats';

const natsConfig = {
    servers: [`nats://${__ENV.NATS_HOSTNAME}:4222`],
    unsafe: true,
};

const publisher = new Nats(natsConfig);
const subscriber = new Nats(natsConfig);

export default function () {
    subscriber.subscribe('topic', (msg) => {
        check(msg, {
            'Is expected message': (m) => m.data === 'the message',
            'Is expected topic': (m) => m.topic === 'topic',
            'Is expected header': (m) => m.header['header1'] === 'value1'
        })
    });

    sleep(1)

    publisher.publishWithHeaders('topic', 'the message', { 'header1': 'value1' });

    sleep(1)
}

export function teardown() {
    publisher.close();
    subscriber.close();
}
