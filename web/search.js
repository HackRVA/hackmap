document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.querySelector('search-bar');
  const autocomplete = document.querySelector('autocomplete-suggestions');
  const results = document.querySelector('search-results');

  let containers = [];
  let items = [];

  fetch('/container')
    .then(response => response.json())
    .then(data => containers = data);

  fetch('/item')
    .then(response => response.json())
    .then(data => items = data);

  const searchBarInput = searchBar.querySelector('#search-bar');
  searchBarInput.focus();

  searchBar.addEventListener('search-input', (event) => {
    const query = event.detail;
    if (query) {
      const suggestions = items.filter(item => item.name.toLowerCase().includes(query));
      autocomplete.setSuggestions(suggestions);
    } else {
      autocomplete.setSuggestions([]);
    }
  });

  searchBar.addEventListener('search-enter', (event) => {
    const query = event.detail;
    if (query) {
      const matchedItems = items.filter(item => item.name.toLowerCase().includes(query));
      const resultsData = matchedItems.map(item => {
        const container = containers.find(c => c.id === item.containerId);
        return {
          name: item.name,
          label: container ? container.label : '',
          description: item.description,
          containerImageUrl: `/container/${container.id}.png`,
          imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
          wikiUrl: item.wikiUrl || '#'
        };
      });
      results.setResults(resultsData);
      autocomplete.setSuggestions([]);
    } else {
      results.setResults([]);
    }
  });

  searchBar.addEventListener('search-tab', () => {
    const suggestions = autocomplete.suggestions;
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      searchBar.querySelector('#search-bar').value = firstSuggestion.name;
      autocomplete.setSuggestions([]);
    }
  });

  autocomplete.addEventListener('suggestion-click', (event) => {
    const item = event.detail;
    const container = containers.find(c => c.id === item.containerId);
    if (container) {
      results.setResults([{
        name: item.name,
        label: container.label,
        description: item.description,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
        wikiUrl: item.wikiUrl || '#'
      }]);
      autocomplete.setSuggestions([]);
    }
  });
});
