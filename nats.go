package compare

import "go.k6.io/k6/js/modules"

func init() {
	modules.Register("k6/x/nats", new(Nats))
}

type Nats struct{}

func (*Compare) Publish(foo string) string {
	return foo
}
