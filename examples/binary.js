import {check, sleep} from 'k6';
import {Nats} from 'k6/x/nats';

const natsConfig = {
    servers: [`nats://${__ENV.NATS_HOSTNAME}:4222`],
    unsafe: true,
}
const publisher = new Nats(natsConfig)
const subscriber = new Nats(natsConfig)
const subscription = subscriber.subscribe('topic', (msg) => {
    stack.push(msg)
})
const stack = []

export default function () {
    publisher.publishMsg({
        topic: 'topic',
        raw: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        header: { 'x-custom-header': 'hello' },
    })
    sleep(1)

    const msg = stack.pop()
    console.log(msg)
    check(msg, {
        'received message': (m) => sameBinaryArray(m.raw, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
        'received header': (m) => m.header['x-custom-header'] === 'hello',
    })
}

export function teardown() {
    subscription.close()
    publisher.close()
    subscriber.close()
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