package httprouter

import (
	"io/fs"
	"log"
	"net/http"

	"hackmap/hackmap/store"
	"hackmap/web"
)

type Router struct {
	ItemStore      store.Store[store.Item]
	ContainerStore store.Store[store.Container]
}

func (r *Router) getFrontendHandler() http.Handler {
	distDir, err := fs.Sub(web.FS, ".")
	if err != nil {
		log.Fatalf("Failed to create sub filesystem: %v", err)
	}
	return http.FileServer(http.FS(distDir))
}

func (r *Router) Run(port string) {
	http.Handle("/", r.getFrontendHandler())
	http.HandleFunc("/generateUUID", r.generateUUID)
	http.HandleFunc("/container", r.containerEndpoint)
	http.HandleFunc("/item", r.itemEndpoint)
	http.HandleFunc("/download/containers.csv", r.serveContainersCSV)
	http.HandleFunc("/download/items.csv", r.serveItemsCSV)
	http.HandleFunc("/container/", r.containerImageEndpoint)

	log.Printf("Serving embedded files on HTTP port: %s\n", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}
