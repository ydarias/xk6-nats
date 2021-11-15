package nats

import (
	"fmt"
	"time"

	natsio "github.com/nats-io/nats.go"
	"go.k6.io/k6/js/modules"
)

const version = "v0.0.1"

type NatsMessage struct {
	Data  string
	Topic string
}

func init() {
	modules.Register("k6/x/nats", new(Nats))
	fmt.Println("Running xk6-nats@$" + version)
}

type Nats struct{}

func (n *Nats) Connect(address, certificate, certificateServerName string) (*natsio.Conn, error) {
	options := natsio.GetDefaultOptions()

	return options.Connect()
}

func (n *Nats) Close(conn *natsio.Conn) error {
	if conn == nil {
		return fmt.Errorf("the connection is not valid")
	}

	conn.Close()

	return nil
}

func (n *Nats) Publish(conn *natsio.Conn, topic, message string) error {
	if conn == nil {
		return fmt.Errorf("the connection is not valid")
	}

	fmt.Printf("Publishing [%s] @ %s\n", message, topic)

	return conn.Publish(topic, []byte(message))
}

func (n *Nats) Subscribe(conn *natsio.Conn, topic string, handler func(NatsMessage)) {
	if conn == nil {
		fmt.Errorf("the connection is not valid")
	}

	conn.Subscribe(topic, func(msg *natsio.Msg) {
		fmt.Printf("Processing [%q]\n", msg)
		//message := NatsMessage{
		//	Data:  string(msg.Data),
		//	Topic: msg.Subject,
		//}
		//handler(message)
	})
}

func (n *Nats) Request(conn *natsio.Conn, subject, data string) (string, error) {
	if conn == nil {
		return "", fmt.Errorf("the connection is not valid")
	}

	msg, err := conn.Request(subject, []byte(data), 1*time.Second)
	if err != nil {
		return "", err
	}

	return string(msg.Data), nil
}
