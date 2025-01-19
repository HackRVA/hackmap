package main

import (
	"log"
	"os"

	"hackmap/hackmap/store"
	httprouter "hackmap/hackmap/transport/http"
)

func main() {
	port := "8080"

	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	var containerStore store.Store[store.Container]
	var itemStore store.Store[store.Item]
	var err error

	sheetID := os.Getenv(`HACKMAP_SHEET_ID`)
	credsFilePath := os.Getenv("HACKMAP_SERVICE_ACCOUNT_PATH")
	if len(sheetID) == 0 || len(credsFilePath) == 0 {
		containerStore, err = store.NewContainerCSVStore(store.ContainersFile)
		if err != nil {
			log.Fatalf("failed to create containers store %s", err)
		}
		itemStore, err = store.NewItemCSVStore(store.ItemsFile)
		if err != nil {
			log.Fatalf("failed to create containers store %s", err)
		}
		println("using csv")
	} else {
		containerStore, err = store.NewGoogleSheetsStore[store.Container](credsFilePath, sheetID, "Containers")
		if err != nil {
			log.Fatalf("failed to create containers store %s", err)
		}
		itemStore, err = store.NewGoogleSheetsStore[store.Item](credsFilePath, sheetID, "Items")
		if err != nil {
			log.Fatalf("failed to create containers store %s", err)
		}
		println("using google sheet")
	}

	r := &httprouter.Router{
		ContainerStore: containerStore,
		ItemStore:      itemStore,
	}

	r.Run(port)
}
