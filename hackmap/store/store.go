package store

type Model interface {
	Container | Item
}

type Store[T Model] interface {
	Save([]T) error
	Load() ([]T, error)
}

type Container struct {
	ID          string  `json:"id"`
	X           float64 `json:"x"`
	Y           float64 `json:"y"`
	Width       float64 `json:"width"`
	Height      float64 `json:"height"`
	Label       string  `json:"label"`
	Rotation    float64 `json:"rotation"`
	WikiPage    string  `json:"wikiPage"`
	Description string  `json:"description"`
	ImageUrl    string  `json:"imageUrl"`
}

type Item struct {
	Name        string `json:"name"`
	ContainerID string `json:"containerId"`
	WikiPage    string `json:"wikiPage"`
	Description string `json:"description"`
	ImageUrl    string `json:"imageUrl"`
}
