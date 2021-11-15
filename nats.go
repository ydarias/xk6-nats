package nats

import (
	"context"
	"fmt"
	"time"

	natsio "github.com/nats-io/nats.go"
	"go.k6.io/k6/js/common"
	"go.k6.io/k6/js/modules"
)

type Message struct {
	Data  string
	Topic string
}

type MessageHandler func(Message) error

func init() {
	modules.Register("k6/x/nats", new(Nats))
}

type Nats struct {
	conn *natsio.Conn
}

func (n *Nats) XNats(ctx *context.Context, url string) (interface{}, error) {
	rt := common.GetRuntime(*ctx)
	c, err := natsio.Connect(url)
	if err != nil {
		return nil, err
	}
	p := &Nats{
		conn: c,
	}
	return common.Bind(rt, p, ctx), nil
}

func (n *Nats) Close() {
	if n.conn != nil {
		n.conn.Close()
	}
}

func (n *Nats) Publish(topic, message string) error {
	if n.conn == nil {
		return fmt.Errorf("the connection is not valid")
	}

	return n.conn.Publish(topic, []byte(message))
}

func (n *Nats) Subscribe(topic string, handler MessageHandler) {
	if n.conn == nil {
		fmt.Errorf("the connection is not valid")
	}

	n.conn.Subscribe(topic, func(msg *natsio.Msg) {
		message := Message{
			Data:  string(msg.Data),
			Topic: msg.Subject,
		}
		handler(message)
	})
}

func (n *Nats) Request(subject, data string) Message {
	if n.conn == nil {
		fmt.Errorf("the connection is not valid")
	}

	msg, err := n.conn.Request(subject, []byte(data), 1*time.Second)
	if err != nil {
		fmt.Errorf(err.Error())
	}

	return Message{
		Data:  string(msg.Data),
		Topic: msg.Subject,
	}
}
