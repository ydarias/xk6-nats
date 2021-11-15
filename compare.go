package compare

import "go.k6.io/k6/js/modules"

func init() {
    modules.Register("k6/x/compare", new(Compare))
}

type Compare struct{}

func (*Compare) IsGreater(a, b int) bool {
    return a > b
}
