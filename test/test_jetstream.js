import {check, sleep} from 'k6';
import {Nats} from 'k6/x/nats';

const natsConfig = {
    servers: [`nats://${__ENV.NATS_HOSTNAME}:4222`],
    unsafe: true,
};

const streamConfig = {
    name: "mock",
    subjects: ["foo"],
    max_msgs_per_subject: 100,
    discard: 0,
    storage: 1
}

let counter = 0;
const responses = {};

const publisher = new Nats(natsConfig);
publisher.jetStreamSetup(streamConfig);
sleep(3);

const subscriber = new Nats(natsConfig);
const subscription = subscriber.jetStreamSubscribe("foo", (msg) => {
    responses[msg.data] = msg;
});

export default function () {
    const data = `${++counter}the message`;
    publisher.jetStreamPublish("foo", data)
    sleep(1)

    const message = responses[data];
    check(message, {
        'Is expected message': (m) => m.data === data,
        'Is expected stream topic': (m) => m.topic === "foo",
    });
}

export function teardown() {
    subscription.close();
    subscriber.close();
    publisher.jetStreamDelete("mock")
    sleep(1)
    publisher.close();
}
