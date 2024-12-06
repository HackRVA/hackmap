package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gofrs/flock"
)

const (
	containersFile = "/store/containers.csv"
	itemsFile      = "/store/items.csv"
)

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

func saveContainers(w http.ResponseWriter, r *http.Request) {
	var containers []Container
	if err := json.NewDecoder(r.Body).Decode(&containers); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Error decoding containers: %v", err)
		return
	}

	fileLock := flock.New(containersFile + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !locked {
		http.Error(w, "Could not acquire file lock", http.StatusInternalServerError)
		return
	}
	defer fileLock.Unlock()

	file, err := os.Create(containersFile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	writer.Write([]string{"id", "x", "y", "width", "height", "label", "rotation", "wikiPage", "description", "imageUrl"})
	for _, container := range containers {
		log.Printf("Writing container: %+v", container)
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
			log.Printf("Error writing container to file: %v", err)
		}
	}

	w.WriteHeader(http.StatusOK)
}

func loadContainers(w http.ResponseWriter, r *http.Request) {
	fileLock := flock.New(containersFile + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error acquiring file lock: %v", err)
		return
	}
	if !locked {
		http.Error(w, "Could not acquire file lock", http.StatusInternalServerError)
		return
	}
	defer fileLock.Unlock()

	file, err := os.Open(containersFile)
	if os.IsNotExist(err) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Container{})
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if len(records) <= 1 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Container{})
		return
	}

	var containers []Container
	for _, record := range records[1:] {
		if len(record) >= 10 {
			containers = append(containers, Container{
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(containers)
}

func saveItems(w http.ResponseWriter, r *http.Request) {
	var items []Item
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Error decoding items: %v", err)
		return
	}

	log.Printf("Received items: %+v", items)

	fileLock := flock.New(itemsFile + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error acquiring file lock: %v", err)
		return
	}
	if !locked {
		http.Error(w, "Could not acquire file lock", http.StatusInternalServerError)
		log.Println("Could not acquire file lock")
		return
	}
	defer fileLock.Unlock()

	file, err := os.Create(itemsFile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error creating items file: %v", err)
		return
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	writer.Write([]string{"name", "containerId", "wikiPage", "description", "imageUrl"})
	for _, item := range items {
		log.Printf("Writing item: %+v", item)
		err := writer.Write([]string{
			item.Name,
			item.ContainerID,
			item.WikiPage,
			item.Description,
			item.ImageUrl,
		})
		if err != nil {
			log.Printf("Error writing item to file: %v", err)
		}
	}

	w.WriteHeader(http.StatusOK)
}

func loadItems(w http.ResponseWriter, r *http.Request) {
	fileLock := flock.New(itemsFile + ".lock")
	locked, err := fileLock.TryLock()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error acquiring file lock: %v", err)
		return
	}
	if !locked {
		http.Error(w, "Could not acquire file lock", http.StatusInternalServerError)
		log.Println("Could not acquire file lock")
		return
	}
	defer fileLock.Unlock()

	file, err := os.Open(itemsFile)
	if os.IsNotExist(err) {
		// File does not exist, return an empty array
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Item{})
		log.Println("Items file does not exist, returning empty array")
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error opening items file: %v", err)
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error reading items file: %v", err)
		return
	}

	if len(records) <= 1 {
		// No data rows, return an empty array
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Item{})
		log.Println("Items file is empty, returning empty array")
		return
	}

	var items []Item
	for _, record := range records[1:] {
		if len(record) >= 5 {
			items = append(items, Item{
				Name:        record[0],
				ContainerID: record[1],
				WikiPage:    record[2],
				Description: record[3],
				ImageUrl:    record[4],
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func serveContainersCSV(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, containersFile)
}

func serveItemsCSV(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, itemsFile)
}

func atof(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}
