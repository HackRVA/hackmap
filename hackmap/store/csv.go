package store

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/gofrs/flock"
)

const (
	ContainersFile = "./store/containers.csv"
	ItemsFile      = "./store/items.csv"
	storeDir       = "./store"
)

type ContainerStore struct {
	filePath string
}

func NewContainerCSVStore(filePath string) (*ContainerStore, error) {
	if err := ensureStoreDir(); err != nil {
		return nil, err
	}
	return &ContainerStore{filePath: filePath}, nil
}

func (s *ContainerStore) Save(data []Container) error {
	fileLock := flock.New(s.filePath + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		return fmt.Errorf("could not acquire file lock: %w", err)
	}
	if !locked {
		return fmt.Errorf("could not acquire file lock")
	}
	defer fileLock.Unlock()

	file, err := os.Create(s.filePath)
	if err != nil {
		return fmt.Errorf("could not create file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	writer.Write([]string{"id", "x", "y", "width", "height", "label", "rotation", "wikiPage", "description", "imageUrl"})
	for _, container := range data {
		err := writer.Write([]string{
			container.ID,
			fmt.Sprintf("%f", container.X),
			fmt.Sprintf("%f", container.Y),
			fmt.Sprintf("%f", container.Width),
			fmt.Sprintf("%f", container.Height),
			container.Label,
			fmt.Sprintf("%f", container.Rotation),
			container.WikiPage,
			container.Description,
			container.ImageUrl,
		})
		if err != nil {
			return fmt.Errorf("could not write container to file: %w", err)
		}
	}

	return nil
}

func (s *ContainerStore) Load() ([]Container, error) {
	fileLock := flock.New(s.filePath + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		return nil, fmt.Errorf("could not acquire file lock: %w", err)
	}
	if !locked {
		return nil, fmt.Errorf("could not acquire file lock")
	}
	defer fileLock.Unlock()

	file, err := os.Open(s.filePath)
	if os.IsNotExist(err) {
		return []Container{}, nil
	} else if err != nil {
		return nil, fmt.Errorf("could not open file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("could not read file: %w", err)
	}

	var data []Container
	for _, record := range records[1:] {
		if len(record) >= 10 {
			data = append(data, Container{
				ID:          record[0],
				X:           atof(record[1]),
				Y:           atof(record[2]),
				Width:       atof(record[3]),
				Height:      atof(record[4]),
				Label:       record[5],
				Rotation:    atof(record[6]),
				WikiPage:    record[7],
				Description: record[8],
				ImageUrl:    record[9],
			})
		}
	}

	return data, nil
}

func (s *ContainerStore) RefreshCache() error {
	return nil
}

func (s *ContainerStore) GetCacheInfo() (int, time.Time) {
	return 0, time.Now()
}

type ItemStore struct {
	filePath string
}

func NewItemCSVStore(filePath string) (*ItemStore, error) {
	if err := ensureStoreDir(); err != nil {
		return nil, err
	}
	return &ItemStore{filePath: filePath}, nil
}

func (s *ItemStore) Save(data []Item) error {
	fileLock := flock.New(s.filePath + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		return fmt.Errorf("could not acquire file lock: %w", err)
	}
	if !locked {
		return fmt.Errorf("could not acquire file lock")
	}
	defer fileLock.Unlock()

	file, err := os.Create(s.filePath)
	if err != nil {
		return fmt.Errorf("could not create file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	writer.Write([]string{"name", "containerId", "wikiPage", "description", "imageUrl"})
	for _, item := range data {
		err := writer.Write([]string{
			item.Name,
			item.ContainerID,
			item.WikiPage,
			item.Description,
			item.ImageUrl,
		})
		if err != nil {
			return fmt.Errorf("could not write item to file: %w", err)
		}
	}

	return nil
}

func (s *ItemStore) Load() ([]Item, error) {
	fileLock := flock.New(s.filePath + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		return nil, fmt.Errorf("could not acquire file lock: %w", err)
	}
	if !locked {
		return nil, fmt.Errorf("could not acquire file lock")
	}
	defer fileLock.Unlock()

	file, err := os.Open(s.filePath)
	if os.IsNotExist(err) {
		return []Item{}, nil
	} else if err != nil {
		return nil, fmt.Errorf("could not open file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("could not read file: %w", err)
	}

	var data []Item
	for _, record := range records[1:] {
		if len(record) >= 5 {
			data = append(data, Item{
				Name:        record[0],
				ContainerID: record[1],
				WikiPage:    record[2],
				Description: record[3],
				ImageUrl:    record[4],
			})
		}
	}

	return data, nil
}

func (s *ItemStore) RefreshCache() error {
	return nil
}

func (s *ItemStore) GetCacheInfo() (int, time.Time) {
	return 0, time.Now()
}

func ensureStoreDir() error {
	if _, err := os.Stat(storeDir); os.IsNotExist(err) {
		if err := os.Mkdir(storeDir, 0o755); err != nil {
			return err
		}
	}
	return nil
}

func atof(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}
