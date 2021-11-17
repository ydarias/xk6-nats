package nats

import (
	"context"
	"crypto/tls"
	"fmt"
	"time"

	natsio "github.com/nats-io/nats.go"
	"go.k6.io/k6/js/common"
	"go.k6.io/k6/js/modules"
)

func init() {
	modules.Register("k6/x/nats", new(Nats))
}

type Nats struct {
	conn *natsio.Conn
}

// XNats JS constructor
func (n *Nats) XNats(ctx *context.Context, configuration Configuration) (interface{}, error) {
	rt := common.GetRuntime(*ctx)

	natsOptions := natsio.GetDefaultOptions()
	natsOptions.Servers = configuration.Servers
	if configuration.Unsafe {
		natsOptions.TLSConfig = &tls.Config{
			InsecureSkipVerify: true,
		}
	}
	if configuration.Token != "" {
		natsOptions.Token = configuration.Token
	}

	c, err := natsOptions.Connect()
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

func (n *Nats) Subscribe(topic string, handler MessageHandler) error {
	if n.conn == nil {
		return fmt.Errorf("the connection is not valid")
	}

	_, err := n.conn.Subscribe(topic, func(msg *natsio.Msg) {
		message := Message{
			Data:  string(msg.Data),
			Topic: msg.Subject,
		}
		handler(message)
	})

	return err
}

func (n *Nats) Request(subject, data string) (Message, error) {
	if n.conn == nil {
		return Message{}, fmt.Errorf("the connection is not valid")
	}

	msg, err := n.conn.Request(subject, []byte(data), 5*time.Second)
	if err != nil {
		return Message{}, err
	}

	return Message{
		Data:  string(msg.Data),
		Topic: msg.Subject,
	}, nil
}

type Configuration struct {
	Servers []string
	Unsafe  bool
	Token   string
}

type Message struct {
	Data  string
	Topic string
}

type MessageHandler func(Message)
