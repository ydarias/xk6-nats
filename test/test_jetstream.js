import {check, sleep} from 'k6';
import {Nats} from 'k6/x/nats';

const natsConfig = {
    servers: ['nats://localhost:4222'],
    unsafe: true,
};

const sub = "foo"

const streamConfig = {
    // snake case
    name: "mock",
    subjects: [sub],
    max_msgs_per_subject: 1,
    discard: 0,
    storage_type: 1
}

const subscriber = new Nats(natsConfig);
const publisher = new Nats(natsConfig);

export default function () {

    publisher.jetStreamSetup(streamConfig)
    sleep(3)
    publisher.jetStreamPublish(sub, "I am a foo")
    sleep(1)

    // const sub = "foo"

    subscriber.jetStreamSubscribe(sub, (msg) => {
        check(msg, {
            'Is expected message': (m) => m.data === "I am a foo",
            'Is expected stream topic': (m) => m.topic === sub,
       })
    });

    sleep(1)

}

export function teardown() {
    subscriber.close();
    publisher.jetStreamDelete("mock")
    sleep(1)
    publisher.close();
}
