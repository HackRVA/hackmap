package httprouter

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"hackmap/hackmap/store"
)

func (router *Router) containerEndpoint(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			router.drawContainers(w, r)
			return
		}
		router.loadContainers(w, r)
		return
	}
	if r.Method == http.MethodPost {
		router.saveContainers(w, r)
		return
	}
}

func (router *Router) containerImageEndpoint(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		pathParts := strings.Split(r.URL.Path, "/")
		if len(pathParts) < 3 {
			http.Error(w, "Invalid URL path", http.StatusBadRequest)
			return
		}
		containerID := strings.TrimSuffix(pathParts[2], ".png")
		if containerID == "" {
			http.Error(w, "Missing container ID", http.StatusBadRequest)
			return
		}

		router.drawContainersWithID(w, r, containerID)
		return
	}
}

func (router *Router) saveContainers(w http.ResponseWriter, r *http.Request) {
	var containers []store.Container
	if err := json.NewDecoder(r.Body).Decode(&containers); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Error decoding containers: %v", err)
		return
	}

	if err := router.ContainerStore.Save(containers); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error saving containers: %v", err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (router *Router) loadContainers(w http.ResponseWriter, _ *http.Request) {
	containers, err := router.ContainerStore.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error loading containers: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(containers)
}

func (router *Router) itemEndpoint(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		router.loadItems(w, r)
		return
	}
	if r.Method == http.MethodPost {
		router.saveItems(w, r)
		return
	}
}

func (router *Router) saveItems(w http.ResponseWriter, r *http.Request) {
	var items []store.Item
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Error decoding items: %v", err)
		return
	}

	if err := router.ItemStore.Save(items); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error saving items: %v", err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (router *Router) loadItems(w http.ResponseWriter, _ *http.Request) {
	items, err := router.ItemStore.Load()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error loading items: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (router *Router) serveContainersCSV(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, store.ContainersFile)
}

func (router *Router) serveItemsCSV(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, store.ItemsFile)
}

func (router *Router) generateUUID(w http.ResponseWriter, _ *http.Request) {
	uuid := store.GenerateUUID()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"uuid": uuid})
}

func (router *Router) refreshCacheEndpoint(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	err := router.ContainerStore.RefreshCache()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error refreshing container cache: %v", err)
		return
	}

	err = router.ItemStore.RefreshCache()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Printf("Error refreshing item cache: %v", err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (router *Router) cacheInfoEndpoint(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	containerCount, containerUpdated := router.ContainerStore.GetCacheInfo()
	itemCount, itemUpdated := router.ItemStore.GetCacheInfo()

	cacheInfo := map[string]interface{}{
		"containers": map[string]interface{}{
			"count":   containerCount,
			"updated": containerUpdated,
		},
		"items": map[string]interface{}{
			"count":   itemCount,
			"updated": itemUpdated,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cacheInfo)
}
