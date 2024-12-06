package main

import (
	"io/fs"
	"log"
	"net/http"
	"os"

	"hackmap/web"
)

func main() {
	port := "8080"

	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	if err := ensureStoreDir(); err != nil {
		log.Fatalf("Failed to ensure store directory: %v", err)
	}

	distDir, err := fs.Sub(web.FS, ".")
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %v", err)
	}

	fileServer := http.FileServer(http.FS(distDir))

	http.Handle("/", fileServer)
	http.HandleFunc("/saveContainers", saveContainers)
	http.HandleFunc("/loadContainers", loadContainers)
	http.HandleFunc("/saveItems", saveItems)
	http.HandleFunc("/loadItems", loadItems)
	http.HandleFunc("/containers.csv", serveContainersCSV)
	http.HandleFunc("/items.csv", serveItemsCSV)

	log.Printf("Serving embedded files on HTTP port: %s\n", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}

func ensureStoreDir() error {
	const storeDir = "/store"
	if _, err := os.Stat(storeDir); os.IsNotExist(err) {
		if err := os.Mkdir(storeDir, 0o755); err != nil {
			return err
		}
	}
	return nil
}
