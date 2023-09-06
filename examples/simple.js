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
    publisher.publish('topic', 'hello world')
    sleep(1)

    const msg = stack.pop()
    check(msg, {
        'received message': (m) => m.data === 'hello world',
    })
}

export function teardown() {
    subscription.close()
    publisher.close()
    subscriber.close()
}