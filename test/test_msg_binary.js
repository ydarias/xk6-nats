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
    const binaryData = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    publisher.publishMsg({
        topic: 'topic',
	    raw: binaryData
    });
    sleep(1)

    const message = responses.pop();
    check(message, {
        'Is expected message': (m) => sameBinaryArray(m.raw, binaryData),
        'Is expected topic': (m) => m.topic === 'topic',
    })
}

export function teardown() {
    subscription.close();
    publisher.close();
    subscriber.close();
}

function sameBinaryArray(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
