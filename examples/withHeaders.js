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
    publisher.publishWithHeaders('topic', 'hello world', { 'header1': 'value1' })
    sleep(1)

    const msg = stack.pop()
    check(msg, {
        'received message': (m) => m.data === 'hello world',
        'received header': (m) => m.header['header1'] === 'value1'
    })
}

export function teardown() {
    subscription.close()
    publisher.close()
    subscriber.close()
}