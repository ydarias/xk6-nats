import {check, sleep} from 'k6';
import {Nats} from 'k6/x/nats';

const natsConfig = {
    servers: [`nats://${__ENV.NATS_HOSTNAME}:4222`],
    unsafe: true,
};

const publisher = new Nats(natsConfig);
const subscriber = new Nats(natsConfig);
const responses = [];
const subscription = subscriber.subscribe('topic', (msg) => {
    responses.push(msg);
});

export default function () {
    const data = 'hello world';

    publisher.publishMsg({
        topic: 'topic',
	    data: data
    });
    sleep(1)

    const message = responses.pop();
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

