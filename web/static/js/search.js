document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.querySelector("search-bar");
  const autocomplete = document.querySelector("autocomplete-suggestions");
  const results = document.querySelector("search-results");

  let containers = [];
  let items = [];

  fetch("/container")
    .then((response) => response.json())
    .then((data) => (containers = data));

  fetch("/item")
    .then((response) => response.json())
    .then((data) => (items = data));

  const searchBarInput = searchBar.querySelector("#search-bar");
  searchBarInput.focus();

  searchBar.addEventListener("search-input", (event) => {
    const query = event.detail;
    if (query) {
      const itemSuggestions = items.filter((item) =>
        item.name.toLowerCase().includes(query),
      );
      const containerSuggestions = containers
        .filter((container) =>
          container.label.toLowerCase().includes(query),
        )
        .map((container) => ({
          ...container,
          name: container.label,
          isContainer: true,
        }));
      const suggestions = [...containerSuggestions, ...itemSuggestions];
      autocomplete.setSuggestions(suggestions);
    } else {
      autocomplete.setSuggestions([]);
    }
  });

  searchBar.addEventListener("search-enter", (event) => {
    const query = event.detail;
    if (query) {
      const matchedContainers = containers.filter((container) =>
        container.label.toLowerCase().includes(query),
      );
      const matchedItems = items.filter((item) =>
        item.name.toLowerCase().includes(query),
      );

      const containerResults = matchedContainers.map((container) => ({
        name: container.label,
        label: "",
        description: container.description,
        containerImageUrl: `/container/${container.id}.png`,
        imageUrl: container.imageUrl,
        wikiUrl: container.wikiPage || "#",
        type: "Container",
      }));

      const itemResults = matchedItems.map((item) => {
        const container = containers.find((c) => c.id === item.containerId);
        return {
          name: item.name,
          label: container ? container.label : "",
          description: item.description,
          containerImageUrl: container ? `/container/${container.id}.png` : null,
          imageUrl: item.imageUrl,
          wikiUrl: item.wikiPage || "#",
          type: "Item",
        };
      });

      const resultsData = [...containerResults, ...itemResults];
      results.setResults(resultsData);
      autocomplete.setSuggestions([]);
    } else {
      results.setResults([]);
    }
  });

  searchBar.addEventListener("search-tab", () => {
    const suggestions = autocomplete.suggestions;
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      searchBar.querySelector("#search-bar").value = firstSuggestion.name;
      autocomplete.setSuggestions([]);
    }
  });

  autocomplete.addEventListener("suggestion-click", (event) => {
    const item = event.detail;

    if (item.isContainer) {
      results.setResults([
        {
          name: item.label,
          label: "",
          description: item.description,
          containerImageUrl: `/container/${item.id}.png`,
          imageUrl: item.imageUrl,
          wikiUrl: item.wikiPage || "#",
          type: "Container",
        },
      ]);
    } else {
      const container = containers.find((c) => c.id === item.containerId);
      if (container) {
        results.setResults([
          {
            name: item.name,
            label: container.label,
            description: item.description,
            containerImageUrl: `/container/${container.id}.png`,
            imageUrl: item.imageUrl,
            wikiUrl: item.wikiPage || "#",
            type: "Item",
          },
        ]);
      }
    }
    autocomplete.setSuggestions([]);
  });
});
